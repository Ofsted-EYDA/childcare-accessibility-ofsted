<script>
	// Components for working with Mapbox layers
	import { getData, getColor, getTopo, getBreaks } from "./js/utils.js";
	import Map from './Map.svelte';
	import MapSource from './MapSource.svelte';
	import MapLayer from './MapLayer.svelte';
	import MapTooltip from './MapTooltip.svelte';
  	import { Divider } from "@onsvisual/svelte-components";
	import { Hero } from "@onsvisual/svelte-components";
	import Em from "./layout/Em.svelte";
	import { LineChart } from "@onsvisual/svelte-charts";
	import timeData from "./timeData";

	// Defining colours
	const colors = {
		seq5: ['rgb(234, 236, 177)', 'rgb(169, 216, 145)', 'rgb(0, 167, 186)', 'rgb(0, 78, 166)', 'rgb(0, 13, 84)'],
		div10: ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061'],
		viridis10: ['#fde725', '#b5de2b', '#6ece58', '#35b779', '#1f9e89', '#26828e', '#31688e', '#3e4989', '#482878', '#440154'],
		d_and_o: ['#d8d9db', '#d13d6a', '#8ab23e']	
	};

	// Functions for chart and map on:select and on:hover events
    function doSelect(e) {
        console.log(e);
        selected = e.detail.id;
        if (e.detail.feature) fitById(selected); // Fit map if select event comes from map
    }
    function doHover(e) {
        hovered = e.detail.id;
    }

	// defining uttla data and bounds (from json)
	const utlaData = "./data/data_utla.csv";
	const utlaBounds = {
	  url: "./data/geo_utla.json",
	  layer: "geog",
	  code: "AREACD"
	};
	
	// defining lsoa data and bounds (vector tiles)
	const datasets = ["lad", "lsoa", "lad_over_time", "utla"];
	const lsoaAccessibilityScores = "./data/data_lsoa.csv";
	const dandoData = "./data/data_dando.csv";
	const lsoaBounds = {
		url: "https://cdn.ons.gov.uk/maptiles/administrative/lsoa/v1/boundaries/{z}/{x}/{y}.pbf",
		layer: "boundaries",
		code: "AREACD"
	};
	const lsoaBuildings11 = {
        url: "https://cdn.ons.gov.uk/maptiles/buildings/v1/{z}/{x}/{y}.pbf",
        layer: "buildings",
        code: "lsoa11cd"
    };
	const ladBounds = {
		url: "https://cdn.ons.gov.uk/maptiles/administrative/2023/ltla/v1/boundaries/{z}/{x}/{y}.pbf",
		layer: "boundaries",
		code: "areacd"
	};

	// defining bounds for maps
	const bounds = {
		uk: [[ -9, 49 ], [ 2, 61 ]],
		ew: [[-6, 49], [2, 56]]
	};

	// defining paths for base maps
	const baseMaps = [
		{
			key: "osm",
			label: "OpenStreetMap",
			path: "./data/style-osm-grey.json"
		},
	];

	
	// Bindings
	let map1, map2, map3, map4;

	// Data
	let data = {lsoa: {}, lad: {}, utla: {}};
	let geojson;
	let geojson2;

	// State
	let zoom;
	let center = {};
	let hovered, selected;
	let animation = true;
	let hover = true;
	let select = true;
	let explore = false;
	let mapHighlighted = [];

	let showSources = true;
	let showLayers = true;
	let visLayers = true;
	let baseMap = baseMaps[0];

	// Get geometry for geojson maps
	getTopo(utlaBounds.url, utlaBounds.layer)
	.then(res => geojson2 = res);
	
	// Get data for geojson maps
	getData(utlaData)
	.then(res => {
		let vals = res.map(d => d.March24Score).sort((a, b) => a - b);
		let len = vals.length;
		let breaks = [
			vals[0],
			vals[Math.floor(len * 0.1)],
			vals[Math.floor(len * 0.2)],
			vals[Math.floor(len * 0.3)],
			vals[Math.floor(len * 0.4)],
			vals[Math.floor(len * 0.5)],
			vals[Math.floor(len * 0.6)],
			vals[Math.floor(len * 0.7)],
			vals[Math.floor(len * 0.8)],
			vals[Math.floor(len * 0.9)],
			vals[len - 1]
		];
		res.forEach(d => {
			d.color = getColor(d.March24Score, breaks, colors.viridis10);
		});
		data.utla = res;
	});

	getData(utlaData)
	.then(res => {
		res.forEach(d => {
			d.color = colors.div10[d.score_change_code];
			d.AREACD = d.AREACD;
		});
		data.utla_change_code = res;
	});

	// Get data for vector tiles map
	getData(lsoaAccessibilityScores)
	.then(res => {
		res.forEach(d => {
			d.color = colors.viridis10[d.decileMarch24];
			d.lsoa11cd = d.code;
		});
		data.lsoaDecilesMarch24 = res;
	});

	getData(dandoData)
	.then(res => {
		res.forEach(d => {
			d.color = colors.d_and_o[d.d_or_o];
			d.AREACD = d.code;
		});
		data.d_or_o = res;
	});

	getData(lsoaAccessibilityScores)
	.then(res => {
		res.forEach(d => {
			d.color = colors.div10[d.score_change_code];
			d.lsoa11cd = d.code;
		});
		data.lsoa_score_change_code = res;
	});

	getData(lsoaAccessibilityScores)
	.then(res => {
		res.forEach(d => {
			d.color = colors.viridis10[d.decileMarch20];
			d.lsoa11cd= d.code;
		});
		data.lsoaDecilesMarch20 = res;
	});

	// setting constant line chart options
	const ChartOptions = {
		xAxis: {label: "Month"},
		yAxis: {label: "overall_accessibility_score"}
	};

</script>

<picture>
	<img src="./data/ofsted-logo.png" alt="Ofsted"
	style="height:100px; margin-bottom: 20px; margin-top: 10px;" aria-hidden="true">
</picture>

<Hero title="Changing childcare accessibility in England - **DUMMY DATA**" lede="This webpage hosts interactive visualisations for our publication which you can read here" date="16 October 2024" height="auto"/>

<section>
	
</section>

<section>
	<div class="grid">
		<div>
			<div class="map">
			  {#if geojson2 && data.utla}
			  <Map id="map1" style={baseMap.path} location={{bounds: bounds.ew}} bind:map={map1} controls={true}>
				{#if showSources}
			<MapSource
				id="ula"
				type="geojson"
				data={geojson2}
				promoteId={utlaBounds.code}
				maxzoom={8}>
				{#if showLayers}
			<MapLayer
				id="utla-fill"
				data={data.utla}
				type="fill"
				hover={true}
				select={true}
				minzoom={4}
				maxzoom={8}
				paint={{
					'fill-color': ['case',
						['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
						'rgba(255, 255, 255, 0)'
					],
					'fill-opacity': 0.8
				}}
					order={baseMap.key === "omt" ? "water_name" : null}
					visible={visLayers}
			/>
			<MapLayer
				id="utla-bg"
				data={data.utla}
				type="fill"
				minzoom={8}
				maxzoom={13}
				paint={{
					'fill-color': ['case',
						['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
						'rgba(255, 255, 255, 0)'
					],
					'fill-opacity': 0.2
				}}
					order={baseMap.key === "omt" ? "water_name" : null}
					visible={visLayers}
			/>
				{/if}
			</MapSource>
				{/if}
				<MapSource
				  	id="lsoa"
				  	type="vector"
				  	url={lsoaBuildings11.url}
				  	layer={lsoaBuildings11.layer}
				  	promoteId={lsoaBuildings11.code}
					minzoom={8}
				  	maxzoom={13}>
				  	{#if showLayers && data}
				  	<MapLayer
				  		id="lsoa"
				  		data={data.lsoaDecilesMarch24}
				  		type="fill"
				  		minzoom={8}
				  		paint={{
				  			'fill-color': ['case',
				  				['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
				  				'rgba(255, 255, 255, 0)'
				  			],
				  			'fill-opacity': 0.9
				  		}}
							order={baseMap.key === "omt" ? "water_name" : null}
							visible={visLayers}
				    />
				  	{/if}
			  	</MapSource>
		  </Map>
			  {/if}
			</div>
			<div>
				<picture>
					<img src="./data/viridis_scale.png" alt="Childcare accessibility"
					style="height:40px; margin-bottom: 0px; margin-top: 15px; margin-left: 10px;" aria-hidden="true">
				</picture>
			</div>
			<h2>Childcare accessibility as at 31 March 2024 (accessible places per child)</h2>
			<p>View the underlying data here</p>
		</div>

		<div>
			<div class="map">
			  <Map id="map2" style={baseMap.path} location={{bounds: bounds.ew}} bind:map={map2} controls={true}>
					{#if showSources}

				<MapSource
					id="utla"
					type="geojson"
					data={geojson2}
					promoteId={utlaBounds.code}
					maxzoom={7}>
					{#if showLayers && data.utla}
				<MapLayer
					id="utla-fill"
					data={data.utla_change_code}
					type="fill"
					minzoom={4}
					maxzoom={8}
					paint={{
						'fill-color': ['case',
							['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
							'rgba(255, 255, 255, 0)'
						],
						'fill-opacity': 0.8
					}}
						order={baseMap.key === "omt" ? "water_name" : null}
						visible={visLayers}
				/>
				<MapLayer
					id="lad-bg"
					data={data.utla_change_code}
					type="fill"
					minzoom={7}
					maxzoom={13}
					paint={{
						'fill-color': ['case',
							['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
							'rgba(255, 255, 255, 0)'
						],
						'fill-opacity': 0.2
					}}
						order={baseMap.key === "omt" ? "water_name" : null}
						visible={visLayers}
				/>
					{/if}
				</MapSource>
					{/if}
				<MapSource
				  	id="lsoa"
				  	type="vector"
				  	url={lsoaBuildings11.url}
				  	layer={lsoaBuildings11.layer}
				  	promoteId={lsoaBuildings11.code}
					minzoom={8}
				  	maxzoom={13}>
				  	{#if showLayers && data}
				  	<MapLayer
				  		id="lsoa"
				  		data={data.lsoa_score_change_code}
				  		type="fill"
				  		minzoom={8}
				  		paint={{
				  			'fill-color': ['case',
				  				['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
				  				'rgba(255, 255, 255, 0)'
				  			],
				  			'fill-opacity': 0.9
				  		}}
							order={baseMap.key === "omt" ? "water_name" : null}
							visible={visLayers}
				    />
				  	{/if}
			  	</MapSource>
			  </Map>
			</div>
			<div>
				<picture>
					<img src="./data/change_scale.png" alt="Change in childcare accessibility"
					style="height:55px; margin-bottom: 0px; margin-top: 15px; margin-left: 10px;" aria-hidden="true">
				</picture>
			</div>
			<h2>Change in childcare accessibility since 31 March 2020</h2>
			<p>View the underlying data here</p>
		</div>
  </div>
</section>

<section>
</section>
<section>
</section>

<section>
	<div class="grid">
		<div>
			<div class="map">
			  {#if geojson2 && data.utla}
			  <Map id="map3" style={baseMap.path} location={{bounds: bounds.ew}} bind:map={map3} controls={true} minzoom={7}>
				<MapSource
				  	id="lsoa"
				  	type="vector"
				  	url={lsoaBounds.url}
				  	layer={lsoaBounds.layer}
				  	promoteId={lsoaBounds.code}
					minzoom={7}
				  	maxzoom={13}>
				  	{#if showLayers && data}
				  	<MapLayer
				  		id="lsoa"
				  		data={data.d_or_o}
				  		type="fill"
				  		minzoom={7}
				  		paint={{
				  			'fill-color': ['case',
				  				['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
				  				'rgba(255, 255, 255, 0)'
				  			],
				  			'fill-opacity': 0.6
				  		}}
							order={baseMap.key === "omt" ? "water_name" : null}
							visible={visLayers}
				    />
				  	{/if}
			  	</MapSource>
		  </Map>
			  {/if}
			</div>
			<h2>Childcare <Em color={colors.d_and_o[1]}>deserts</Em> and <Em color={colors.d_and_o[2]}>oases</Em> as at 31 March 2024</h2>
		</div>
		<div class="map">
			<LineChart data={timeData.map(d => ({
				year: new Date(`${d.Month}`),
				value: d.overall_accessibility_score,
				group: d.LocalAuthority
			}))}
			xKey="year" yKey="value" zKey="group" mode="default" event_hover={undefined}
			height="475px"
			color="lightgrey"
			lineWidth={1} xTicks={5} snapTicks={false}
			colorHover="red"
			{animation} labels
			{hover} {select}
			padding={{ top: 0, bottom: 25, left: 35, right: 100 }}
			xScale="time"
			xFormatTickString='20%y'
			subtitle = "Childcare accessibility (places per child)"/>
			<h2>Change in childcare accessibility since March 2020 by local authority</h2>
			</div>
  </div>
</section>

<section>
	<div>
		<p></p>
	</div>
</section>

<style>
	section {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-pack: center;
		-ms-flex-pack: center;
		justify-content: center;
	  background-position: center;
	  background-repeat: no-repeat;
	  background-size: cover;
	  margin: 0;
		margin-bottom: 20px;
	  padding: 0;
	}
	button {
		padding: 0 2px;
		cursor: pointer;
	}
	label {
		display: inline;
		margin-left: 6px;
	}
	.wrapper {
		width: 100%;
		max-width: 768px;
		margin: 0 16;
	}
	.grid {
		display: grid;
		width: 100%;
		max-width: 3500px;
		margin: 0 16;
		grid-gap: 10px;
		grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
		justify-content: stretch;
	}
	.map {
		height: 500px;
	}
	a:hover {
		cursor: pointer;
	}
	h2 {
		font-size: 1.2em;
		font-weight: bold;
	}
</style>
