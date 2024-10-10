<script>
	// Components for working with Mapbox layers
	import { onMount } from 'svelte';
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
	import Scroller from "./layout/Scroller.svelte";
	import { getMotion } from "./js/utils.js";

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
	function dropSelect() {
		let name = selected.name;
		console.log(name + ' selected via dropdown');
	}
	function fitById(id) {
		if (geojson2 && id) {
			let feature = geojson2.features.find(d => d.properties.AREANM == id);
			let bounds = bbox(feature.geometry);
			fitBounds(bounds);
		}
	}
	function fitBounds(bounds) {
		if (map) {
			map.fitBounds(bounds, {animate: animation});
		}
	}

	function handleSelection(value) {
    const location = locations.find(loc => loc.value === value);
    if (location) {
      selectedLocation = location;
      mapCenter = location.coords;
      mapZoom = location.zoom;
    }
  }

	// Update map view when center or zoom changes
	onMount(() => {
    if (map) {
      map.setView(center, zoom);
    }
  });

  function runActions(codes = []) {
		codes.forEach(code => {
			if (id[code] != idPrev[code]) {
				if (actions[code][id[code]]) {
					actions[code][id[code]]();
				}
				idPrev[code] = id[code];
			}
		});
	};

	function handleZoomChange(newZoom) {
    selectedZoom = Number(newZoom);
  }

  function handleCenterChange(newCenter) {
    selectedCenter = JSON.parse(newCenter);
  }
	
	// defining uttla data and bounds (from json)
	const utlaData = "./data/data_utla.csv";
	const utlaBounds = {
	  url: "./data/geo_utla.json",
	  layer: "geog",
	  code: "AREACD",
	  name: "AREANM"
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
		layer: "oa",
		code: "areacd"
	};
	const oaBounds = {
		url: "https://cdn.ons.gov.uk/maptiles/administrative/2021/oa/v3/boundaries/{z}/{x}/{y}.pbf",
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
	let geojson2;

	// State
	let zoom;
	let center = {};
	let hovered, selected;
	let hover = true;
	let select = true;
	let explore = false;
	let mapHighlighted = [];
	let id = {};
	let animation = getMotion();
	let currentRow = null;

	let showSources = true;
	let showLayers = true;
	let visLayers = true;
	let baseMap = baseMaps[0];

	// Reactive statement to update currentRow when hovered changes
    $: if (hovered) {
        currentRow = data.utla.find(row => row.AREANM === hovered) || null;
    }

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
			d.areacd = d.areacd;
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

	// Actions for Scroller components
	const actions = {
		map: { // Actions for <Scroller/> with id="map"
			map04: () => {
				fitBounds(selected);
				mapHighlighted = [];
				explore = true;
			}
		}
	}

</script>

<picture>
	<img src="./data/ofsted-logo.png" alt="Ofsted"
	style="height:100px; margin-bottom: 20px; margin-top: 10px;" aria-hidden="true">
</picture>

<Hero title="Changing childcare accessibility in England - **DUMMY DATA**" lede="This webpage hosts interactive visualisations for our publication which you can read here" date="16 October 2024" height="auto"/>

<section>
	
</section>


<div>
	<h1>Local area change in childcare accessibility since 31 March 2020</h1>
</div>


<Scroller bind:id={id['map']}>
	<div slot="foreground">
		<div data-id="map04">
			<h3>Select a local authority</h3>
		<p>Use the selection box below to see a local authority's change in childcare accessibility.</p>
		{#if geojson2}
			<p>
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:value={selected} on:change={() => fitById(selected)}>
					<option 
						value={null}>Select one
					</option>
					{#each geojson2.features.slice().sort((a, b) => a.properties.AREANM.localeCompare(b.properties.AREANM)) as place}
					<option value={place.properties.AREANM}>
						{place.properties.AREANM}
					</option>
					{/each}
				</select>
			</p>
		{/if}
		</div>
		<div class="grid">
		<div>
			<div class="chart">
				<LineChart data={timeData.map(d => ({
					year: new Date(`${d.Month}`),
					value: d.overall_accessibility_score,
					group: d.LocalAuthority
				}))}
				xKey="year" yKey="value" zKey="group" mode="default" event_hover={undefined}
				height="500px"
				color="lightgrey"
				lineWidth={1} xTicks={5} snapTicks={false}
				colorHover="#d13d6a"
				colorSelect='#170c59'
				{animation} labels
				{hover} {select}
				{selected} on:select={doSelect}
				{hovered} on:hover={doHover}
				padding={{ top: 20, bottom: 25, left: 35, right: 80 }}
				xScale="time"
				xFormatTickString='20%y'
				subtitle = "Childcare accessibility (places per 100 children)"/>
				<h2>Change in childcare accessibility since March 2020 by local authority</h2>
				<p>View the underlying data here</p>
				</div>
	</div>

		<div>
			<div class="map">
			  <Map id="map" style={baseMap.path} location={{bounds: bounds.ew}} bind:map={map2} controls={true}>
					{#if showSources}

				<MapSource
					id="utla"
					type="geojson"
					data={geojson2}
					promoteId={utlaBounds.name}
					maxzoom={7}>
					{#if showLayers}
				<MapLayer
					id="utla-fill"
					data={data.utla_change_code}
					type="fill"
					hover={true}
					minzoom={4}
					maxzoom={8}
					bind:hovered
					select={true}
					bind:selected
					paint={{
						'fill-color': ['case',
							['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
							'rgba(255, 255, 255, 0)'
						],
						'fill-opacity': 0.8
					}}
						order={baseMap.key === "omt" ? "water_name" : null}
						visible={visLayers}
				>
				{#if hovered}
				{#if currentRow}
					<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Change in<br> childcare accessibility: ${currentRow.score_change.toFixed(1)}%</strong>`}/>
				{:else}
					<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Change in<br> childcare accessibility: N/A</strong>`}/>
				{/if}
				{:else}
					<MapTooltip content="Hover over a local authority to see data."/>
				{/if}
				</MapLayer>
				<MapLayer
					id="lad-bg"
					data={data.utla_change_code}
					type="fill"
					minzoom={7}
					maxzoom={13}
					hover={true}
					bind:hovered
					select={true}
					bind:selected
					paint={{
						'fill-color': ['case',
							['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
							'rgba(255, 255, 255, 0)'
						],
						'fill-opacity': 0.2
					}}
						order={baseMap.key === "omt" ? "water_name" : null}
						visible={visLayers}
				>
				{#if hovered}
				{#if currentRow}
					<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Change in<br> childcare accessibility: ${currentRow.score_change.toFixed(1)}%</strong>`}/>
				{:else}
					<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Change in<br> childcare accessibility: N/A</strong>`}/>
				{/if}
				{:else}
					<MapTooltip content="Hover over a local authority to see data."/>
				{/if}
				</MapLayer>
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
</Scroller>

<section2>
</section2>
<section2>
</section2>

<div>
	<h1>Local childcare accessibility as at 31 March 2024</h1>
</div>
<section>
</section>

<section>
	<div class="grid">
		<div>
			<div class="map">
				{#if geojson2}
			  <Map id="map1" style={baseMap.path} location={{bounds: bounds.ew}} bind:map1 controls={true} explore={true} zoom={zoom} {animation} {selected}>
				  {#if showSources}
					  <MapSource
					  id="ula"
					  type="geojson"
					  data={geojson2}
					  promoteId={utlaBounds.name}
					  maxzoom={8}
					  {selected}
					  {animation} labels
			  `       {hover} {select}
					  on:select={doSelect}
					  {hovered} on:hover={doHover}>
						  {#if showLayers}
						  <MapLayer
						  {animation}
						  id="utla-fill"
						  data={data.utla}
						  type="fill"
						  select {selected} on:select={doSelect}
						  hover {hovered} on:hover={doHover}
						  highlight highlighted={mapHighlighted}
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
						  >
						  {#if hovered}
							{#if currentRow}
								<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Accessible places<br> per 100 children: ${currentRow.March24Score.toFixed(1)}</strong>`}/>
							{:else}
								<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Accessible places<br> per 100 children: N/A</strong>`}/>
							{/if}
						{:else}
							<MapTooltip content="Hover over a local authority to see data."/>
						{/if}
						  </MapLayer>
						  <MapLayer
						  id="utla-bg"
						  data={data.utla}
						  type="fill"
						  hover={true}
						  minzoom={8}
						  bind:hovered
						  select={true}
						  bind:selected
						  paint={{
							  'fill-color': ['case',
								  ['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
								  'rgba(255, 255, 255, 0)'
							  ],
							  'fill-opacity': 0.2
						  }}
							  order={baseMap.key === "omt" ? "water_name" : null}
							  visible={visLayers}
						  >
						  {#if hovered}
							{#if currentRow}
								<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Accessible places<br> per 100 children: ${currentRow.March24Score.toFixed(1)}</strong>`}/>
							{:else}
								<MapTooltip content={`Local Authority: ${hovered}<br> <strong>Accessible places<br> per 100 children: N/A</strong>`}/>
							{/if}
						{:else}
							<MapTooltip content="Hover over a local authority to see data."/>
						{/if}
						  </MapLayer>
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
	  <div class="grid">
		<div>
			<div class="map">
				{#if geojson2}
			  <Map id="map3" style={baseMap.path} location={{bounds: bounds.ew}} bind:map3 controls={true} explore={true} zoom={zoom} {animation} {selected} minzoom={7}>
				<MapSource
						  id="lsoa"
						  type="vector"
						  url={oaBounds.url}
						  layer={oaBounds.layer}
						  promoteId={oaBounds.code}
						  >
					  {#if showLayers && data}
						  <MapLayer
							  id="lsoa2"
							  data={data.d_or_o}
							  type="fill"
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
				  {#if showSources}
					  <MapSource
					  id="ula"
					  type="geojson"
					  data={geojson2}
					  promoteId={utlaBounds.name}>
					  <MapLayer
						  id="utla-blank-fill"
						  type="fill"
						  data={data.utla}
						  select {selected} on:select={doSelect}
						  hover {hovered} on:hover={doHover}
						  maxzoom={13}
						  paint={{
							'fill-color': ['case',
								['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],
								'rgba(255, 255, 255, 0)'
							],
							'fill-opacity': 0
						}}
						>
							<MapTooltip content={`Local Authority: ${hovered}`}/>
						  </MapLayer>
						  <MapLayer
						  id="utla-line"
						  type="line"
						  maxzoom={13}
						  paint={{
							'line-color': 'black',
							'line-width': 1.5
						}}
						  >
						  </MapLayer>
					  </MapSource>
						  {/if}
			  </Map>
				{/if}
				<h2>Childcare <Em color={colors.d_and_o[1]}>deserts</Em> and <Em color={colors.d_and_o[2]}>oases</Em></h2>
			  </div>
	  </div>
</section>

<section>
	<div>
		<p></p>
	</div>
</section>


	<div>
	</div>
	<div>
		<p>We would like to thank the Office for National Statistics for publishing the templates and components used in these visualisations. This page was built using a Github repository which is available <a href="https://github.com/ONSvisual/svelte-maps/tree/main">here</a>.</p>
	</div>

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
	section2 {
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
		margin-bottom: 0px;
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
	.chart {
		height: 700px;
	}
	a:hover {
		cursor: pointer;
	}
	h2 {
		font-size: 1.2em;
		font-weight: bold;
	}
</style>