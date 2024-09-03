<script>
	// Components for working with Mapbox layers
	import { getData, getColor, getTopo, getBreaks } from "./js/utils.js";
	import Map from './Map.svelte';
	import MapSource from './MapSource.svelte';
	import MapLayer from './MapLayer.svelte';
	import MapTooltip from './MapTooltip.svelte';
  	import { Divider } from "@onsvisual/svelte-components";
	import { LineChart } from "@onsvisual/svelte-charts";
	
	// Defining colours
	const colors = {
		seq5: ['rgb(234, 236, 177)', 'rgb(169, 216, 145)', 'rgb(0, 167, 186)', 'rgb(0, 78, 166)', 'rgb(0, 13, 84)'],
		div10: ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061'],
		viridis10: ['#fde725', '#b5de2b', '#6ece58', '#35b779', '#1f9e89', '#26828e', '#31688e', '#3e4989', '#482878', '#440154']	
	};

	// defining pcon data and bounds (from json)
  const pconData = "./data/salary-pcon10.csv";
  const pconBounds = {
	  url: "./data/pcon10-bounds.json",
	  layer: "PCONreg",
	  code: "AREACD"
	};
	
	// defining lsoa data and bounds (vector tiles)
	const datasets = ["lad", "lsoa", "lad_over_time"];
	const lsoaData = "./data/imd-lsoa11.csv";
	const ladData = "./data/data_lad.csv";
	const lsoaAccessibilityScores = "./data/data_lsoa.csv";
	const ladOverTime = "./data/data_lad_over_time.csv";
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
	let data = {lsoa: {}, lad: {}};
	let geojson;

	// State
	let zoom;
	let center = {};
	let hovered, selected;

	let showSources = true;
	let showLayers = true;
	let visLayers = true;
	let baseMap = baseMaps[0];

	// Get geometry for geojson maps
	getTopo(pconBounds.url, pconBounds.layer)
	.then(res => geojson = res);
	
	// Get data for geojson maps
	getData(pconData)
	.then(res => {
		let vals = res.map(d => d.salary).sort((a, b) => a - b);
		let len = vals.length;
		let breaks = [
			vals[0],
			vals[Math.floor(len * 0.2)],
			vals[Math.floor(len * 0.4)],
			vals[Math.floor(len * 0.6)],
			vals[Math.floor(len * 0.8)],
			vals[len - 1]
		];
		res.forEach(d => {
			d.color = getColor(d.salary, breaks, colors.seq5);
		});
		data.pcon = res;
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

	getData(lsoaAccessibilityScores)
	.then(res => {
		res.forEach(d => {
			d.color = colors.viridis10[d.decileDec19];
			d.lsoa11cd= d.code;
		});
		data.lsoaDecilesDec19 = res;
	});

	getData(ladData)
	.then(res => {
		res.forEach(d => {
			d.color = colors.viridis10[d.decileDec19];
			d.areacd= d.code;
		});
		data.ladDecilesDec19 = res;
	});

	getData(ladData)
	.then(res => {
		res.forEach(d => {
			d.color = colors.viridis10[d.decileMarch24];
			d.areacd= d.code;
		});
		data.ladDecilesMarch24 = res;
	});

</script>

<section>
	<div class="wrapper">
    <h1>Childcare deserts and oases data viz development</h1>

    <h2>Our first publication is avaible <a href="https://www.ons.gov.uk/peoplepopulationandcommunity/educationandchildcare/articles/childcareaccessibilitybyneighbourhood/2024-06-04"> here</a></h2>
  </div>
</section>

<Divider/>

<section>
	<div class="grid">
		<div>
			<div class="map">
			  {#if geojson && data.pcon}
			  <Map id="map1" style={baseMap.path} location={{bounds: bounds.ew}} bind:map={map1} controls={true} minzoom={4}>
				{#if showSources}

			<MapSource
				id="lad"
				type="vector"
				url={ladBounds.url}
				layer={ladBounds.layer}
				promoteId={ladBounds.code}
				minzoom={4}
				maxzoom={8}>
				{#if showLayers && data}
			<MapLayer
				id="lad"
				data={data.ladDecilesDec19}
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
				data={data.ladDecilesDec19}
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
				  		data={data.lsoaDecilesDec19}
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
			<h2>Childcare accessibility as at 31 December 2019</h2>
		</div>

		<div>
			<div class="map">
			  <Map id="map2" style={baseMap.path} location={{bounds: bounds.ew}} bind:map={map2} controls={true} minzoom={4}>
					{#if showSources}

				<MapSource
					id="lad"
					type="vector"
					url={ladBounds.url}
					layer={ladBounds.layer}
					promoteId={ladBounds.code}
					minzoom={4}
					maxzoom={7}>
					{#if showLayers && data}
				<MapLayer
					id="lad"
					data={data.ladDecilesMarch24}
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
					data={data.ladDecilesMarch24}
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
			</div>
			<h2>Childcare accessibility as at 31 March 2024</h2>
		</div>
  </div>
</section>

<Divider/>

<section>
	<h1>Insert line chart below showing change in accessibility over time for a selected area</h1>
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
