

mapboxgl.accessToken = 'pk.eyJ1IjoiYWhjcmlzdCIsImEiOiJjbTkyMGNvYTkwMHM2MmxuM2ZveGE0cHMyIn0.cETUTrGOPhzETUiIkdsXdg';
const bounds = [
	[-74.67252, 40.45470],
	[-73.42330, 41.09414]
];

// Create map_one_frame, which is an option bw 2018 and 2023 average loan values

const map_one_frame = new mapboxgl.Map({
	container: 'map_one_frame', // container ID
	style: 'mapbox://styles/mapbox/light-v11', // dark style
	//cooperativeGestures: true,
	zoom: 9,
	center: [-74.17723, 40.70818],
	maxBounds: bounds
});

let hoveredId = null;
let activeId = null;
//load the map
map_one_frame.on('load', () => {
	//assign unique IDs to each feature
	fetch('./A_hdma_acs_18_23.geojson')
		.then(response => response.json())
		.then(data => {
			// Assign unique IDs to each feature
			data.features.forEach((feature, index) => {
				feature.id = index
			});

			//add geojson source
			map_one_frame.addSource('ct_boundaries', {
				type: 'geojson',
				data: data
			});

			//disable scroll zoom on map_one_frame
			//map_one_frame.scrollZoom.disable();
			//map_one_frame.addControl(new mapboxgl.FullscreenControl());

			//add 2023 layer source
			map_one_frame.addLayer({
				id: 'layer_2023',
				type: 'fill',
				source: 'ct_boundaries',
				paint: {
					'fill-color': [
						'case',
						['==', ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'], null], 'transparent',
						['boolean', ['feature-state', 'hover'], false], '#f7e0b6',
						['boolean', ['feature-state', 'active'], false], 'rgb(78,171,209)',
						['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'],
							450000, 'rgb(250,174,123)',     // FAAE7B
							720000, 'rgb(218,144,122)',    // DA907A
							1105000, 'rgb(186,115,120)',    // BA7378
							1711000, 'rgb(154,85,119)',    // 9A5577
							3185000, 'rgb(122,56,117)',  // 7A3875
							4565000, 'rgb(90,26,116)']],	//5A1A74
					'fill-opacity': 0,
					'fill-outline-color': 'transparent',
					'fill-opacity-transition': {
						duration: 500,
						delay: 0
					}
				}
			});

			//add 2018 layer 
			map_one_frame.addLayer({
				id: 'layer_2018',
				type: 'fill',
				source: 'ct_boundaries',
				paint: {
					'fill-color': [
						'case',
						['==', ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'], null], 'transparent',
						['boolean', ['feature-state', 'hover'], false], '#f7e0b6',
						['boolean', ['feature-state', 'active'], false], 'rgb(78,171,209)',
						['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2018'],
							281000, 'rgb(250,174,123)',     // FAAE7B
							411667, 'rgb(218,144,122)',    // DA907A
							535000, 'rgb(186,115,120)',    // BA7378
							725000, 'rgb(154,85,119)',    // 9A5577
							1165000, 'rgb(122,56,117)',  // 7A3875
							2005000, 'rgb(90,26,116)']],	//5A1A74
					'fill-opacity': 1,
					'fill-outline-color': 'transparent',
					'fill-opacity-transition': {
						duration: 500,
						delay: 0
					}
				}
				// ,
				// layout: {
				// 	visibility: 'none'
				// }
			});

			//add delta layer
			//map_one_frame.on('load', () => {
			//modify geojson to add difference in loan value property
			fetch('./A_hdma_acs_18_23.geojson')
				.then(response => response.json())
				.then(modified_hdma_data => {
					modified_hdma_data.features.forEach((feature, index) => {
						feature.id = index; // Assign a unique ID to each feature
						const avgLoan2018 = feature.properties.B_download_acs_hdma_2018_2023_average_loan_2018;
						const avgLoan2023 = feature.properties.B_download_acs_hdma_2018_2023_average_loan_2023;
						// Check if both properties exist before calculating the difference
						if (
							avgLoan2018 != null &&
							avgLoan2023 != null &&
							!isNaN(avgLoan2018) &&
							!isNaN(avgLoan2023)
						) {
							feature.properties.difference = avgLoan2023 - avgLoan2018;
						}
					});

					//add the layer as a source to map_one_frame
					map_one_frame.addSource('loan_value_difference_source', {
						type: 'geojson',
						data: modified_hdma_data
					});


					//add extruded layer 
					map_one_frame.addLayer({
						id: 'loan_value_difference_layer',
						type: 'fill-extrusion',
						source: 'loan_value_difference_source',
						filter: ['has', 'difference'],
						paint: {
							'fill-extrusion-height': ['*', ['get', 'difference'], .005], // scaled height
							'fill-extrusion-base': 0,
							'fill-extrusion-color': [
								'case',
								['boolean', ['feature-state', 'hover'], false], '#ffcc99',
								['boolean', ['feature-state', 'active'], false], '#ff6600',
								'rgb(122,56,117)'
							],
							'fill-extrusion-base': 0,
							'fill-extrusion-opacity': 0,
							'fill-extrusion-opacity-transition': {
								duration: 500,
								delay: 0
							}
						}
						// layout: { visibility: 'none' }
					});
					setupInteractivity('layer_2023');
					setupInteractivity('layer_2018');
					setupInteractivity('loan_value_difference_layer', 'loan_value_difference_source');
				});
		});



	function showLayer(layer_to_show) {
		const layers = ['layer_2023', 'layer_2018', 'loan_value_difference_layer'];
		layers.forEach(layer => {
			if (map_one_frame.getLayer(layer)) {
				const isTarget = layer === layer_to_show;
				const opacityProp = layer === 'loan_value_difference_layer' ? 'fill-extrusion-opacity' : 'fill-opacity';

				map_one_frame.setPaintProperty(layer, opacityProp, isTarget ? 1 : 0);
			}
		});
	}

	function setupInteractivity(layerId, sourceId = 'ct_boundaries') {
		map_one_frame.on('mousemove', layerId, (e) => {
			if (e.features.length > 0) {
				const fid = e.features[0].id;
				if (hoveredId !== null && hoveredId !== fid) {
					map_one_frame.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
				}
				hoveredId = fid;
				map_one_frame.setFeatureState({ source: sourceId, id: hoveredId }, { hover: true });
			}
		});

		map_one_frame.on('mouseleave', layerId, () => {
			if (hoveredId !== null) {
				map_one_frame.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
				hoveredId = null;
			}
		});

		map_one_frame.on('click', layerId, (e) => {
			if (activeId !== null) {
				map_one_frame.setFeatureState({ source: sourceId, id: activeId }, { active: false });
			}
			activeId = e.features[0].id;
			map_one_frame.setFeatureState({ source: sourceId, id: activeId }, { active: true });
		});
	}

	document.getElementById('btn-loan-2018').addEventListener('click', () => {
		showLayer('layer_2018');
		map_one_frame.easeTo({
			pitch: 0,
			center: [-74.17723, 40.70818],
			bearing: 0,
			duration: 1000,
			easing: t => t
		});
	});

	document.getElementById('text-btn-loan-2018').addEventListener('click', () => {
		showLayer('layer_2018');
		map_one_frame.easeTo({
			pitch: 0,
			center: [-74.17723, 40.70818],
			bearing: 0,
			duration: 1000,
			easing: t => t
		});
	});
	
	document.getElementById('btn-loan-2023').addEventListener('click', () => {
		showLayer('layer_2023');
		map_one_frame.easeTo({
			pitch: 0,
			center: [-74.17723, 40.70818],
			bearing: 0,
			duration: 1000,
			easing: t => t
		});
	});

	document.getElementById('text-btn-loan-2023').addEventListener('click', () => {
		showLayer('layer_2023');
		map_one_frame.easeTo({
			pitch: 0,
			center: [-74.17723, 40.70818],
			bearing: 0,
			duration: 1000,
			easing: t => t
		});
	});

	document.getElementById('btn-delta-2018-2023').addEventListener('click', () => {
		showLayer('loan_value_difference_layer');
		map_one_frame.easeTo({
			pitch: 60,
			bearing: 0,
			center: [-74.17723, 40.70818],
			duration: 1000,
			easing: t => t
		});
	});

	document.getElementById('text-btn-delta-2018-2023').addEventListener('click', () => {
		showLayer('loan_value_difference_layer');
		map_one_frame.easeTo({
			pitch: 60,
			bearing: 0,
			center: [-74.17723, 40.70818],
			duration: 1000,
			easing: t => t
		});
	});
})

document.addEventListener('DOMContentLoaded', () => {
	const closeBtn = document.getElementById('close-btn');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			document.getElementById('info-box').classList.add('hidden');
		});
	}

	map_one_frame.on('click', ['layer_2023', 'layer_2018', 'loan_value_difference_layer'], (e) => {
		const features = map_one_frame.queryRenderedFeatures(e.point, {
			layers: ['layer_2023', 'layer_2018', 'loan_value_difference_layer']
		});

		if (!features.length) return;
		const props = features[0].properties;

		const formatK = (num) => {
			if (!num) return 'Data not available';
			const rounded = Math.ceil(Number(num) / 1000); // Round up to nearest thousand
			return `$${rounded}K`;
		};
		document.getElementById('info-box').classList.remove('hidden');

		document.getElementById('boro-name').textContent = props.BoroName || 'N/A';
		document.getElementById('neighborhood-name').textContent = props.NTAName || 'N/A';
		document.getElementById('avg-loan-2018').textContent = formatK(props.B_download_acs_hdma_2018_2023_average_loan_2018)
		document.getElementById('avg-loan-2023').textContent = formatK(props.B_download_acs_hdma_2018_2023_average_loan_2023)


	});
	//Create a histogram legend


});
