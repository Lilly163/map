var searchInput = document.getElementById('keyword');
//输入提示组件，在searchInput输入文字后，将自动显示相关的地点提示
var autoComplete = new AMap.Autocomplete({
	input: searchInput,
	citylimit: true,
	noshowDistrict: true
});
//点击搜索按钮的时候执行关键字搜索

// var auto = new AMap.Autocomplete(autoComplete);
var placeSearch = new AMap.PlaceSearch({
	map: map
}); //构造地点查询类
// 点击搜索的时候调用关键字查询函数
$('#searchButton').click(() => {
	placeSearch.search(searchInput.value, (status, SearchResult) => {
		if (status === 'complete') {
			map.clearMap();
			let pois = SearchResult.poiList.pois[0].location;
			let startLng = pois.lng;
			let startLat = pois.lat;
			map.setZoom(13),
				map.setCenter(pois)
			var markerNow = new AMap.Marker({
				position: new AMap.LngLat(pois.lng, pois.lat)
			});
			map.add(markerNow);
			$.ajax({
				url: 'http://101.201.108.106:8127/findAdminStroe?city' + city,
				dataType: 'json',
				success: (data) => {
					let datas = data.data;
					let lnglats = [];
					datas.map((value, index) => {
						lnglats.push([value.longitude, value.latitude])
					})
					// console.log(lnglats)
					for (let i = 0, marker; i < lnglats.length; i++) {
						marker = new AMap.Marker({
							position: lnglats[i],
							map: map,
							icon: './images/result.png', // 添加 Icon 图标 URL
						});
						var walking = new AMap.Walking({
							map: map,
							autoFitView: true,
						});

						marker.on('click', function markerClick(e) {
							$('.detail').css('display', 'block');
							walking.clear(); //清除上一次规划路线
							let endLng = e.lnglat.lng;
							let endLat = e.lnglat.lat;
							console.log(startLng, startLat, endLng, endLat)
							$('.storeName div>.title').html(datas[i].name);
							$('.location').html(datas[i].address);
							$('.storeName .phone').attr('href', 'tel:' + datas[i].phone);
							// 根据起终点经纬度规划步行导航路线

							walking.search([startLng, startLat], [endLng, endLat]);
							//  $('.storeName .map').attr('href',`http://uri.amap.com/navigation?from=${startLng},${startLat}&to=${endLng},${endLat}&mode=walk&policy=1&src=mypage&coordinate=gaode&callnative=0`);
							$('.storeName .map').click(() => {

								walking.searchOnAMAP({
									origin: [startLng, startLat],
									destination: [endLng, endLat]
								})
							})
						})
						map.add(marker);
					}
				}
			})
		} else {
			Dialog.init('搜索地点不存在,请更换搜索关键词', 2000);
		}


	});
})
// 选中某一条下拉提示时触发
AMap.event.addListener(autoComplete, "select", select); //注册监听，当选中某条记录时会触发
function select(e) {
	map.clearMap();
	let startLng = e.poi.location.lng;
	let startLat = e.poi.location.lat;
	// document.getElementById('mask').style.display = 'block';
	let strLeng = e.poi.district;
	let strLengLimit1 = strLeng.indexOf('省');
	let strLengLimit2 = strLeng.indexOf('市');
	let strLengLimit3 = strLeng.indexOf('自治区');
	if (strLengLimit1 !== -1) { //省内市
		let strLengLimitSpecial = strLeng.indexOf('市');
		city = strLeng.substring(strLengLimit1 + 1, strLengLimitSpecial) + '市';
	} else if (strLengLimit2 !== -1) {
		city = strLeng.substring(0, strLengLimit2) + '市'
	} else if( strLengLimit3 !== -1 ) {
		let strLengLimitSpecial = strLeng.indexOf('市');
		city = strLeng.substring(strLengLimit3 + 3, strLengLimitSpecial) + '市'
		console.log(strLengLimit3)
		console.log(strLengLimitSpecial)
	}
	console.log(city)
	if (e.poi && e.poi.location) {
		map.setZoom(13),
			map.setCenter(e.poi.location)
		var markerNow = new AMap.Marker({
			position: new AMap.LngLat(e.poi.location.lng, e.poi.location.lat)
		});
		map.add(markerNow);
		$.ajax({
			url: 'http://101.201.108.106:8127/findAdminStroe?city=' + city,
			dataType: 'json',
			success: (data) => {
				let datas = data.data;
				let lnglats = [];
				datas.map((value, index) => {
					lnglats.push([value.longitude, value.latitude])
				})
				// console.log(lnglats)
				for (let i = 0, marker; i < lnglats.length; i++) {
					marker = new AMap.Marker({
						position: lnglats[i],
						map: map,
						icon: './images/result.png', // 添加 Icon 图标 URL
					});
					var walking = new AMap.Walking({
						map: map,
						autoFitView: true,
					});

					marker.on('click', function markerClick(e) {
						$('.detail').css('display', 'block');
						walking.clear(); //清除上一次规划路线
						let endLng = e.lnglat.lng;
						let endLat = e.lnglat.lat;
						console.log(startLng, startLat, endLng, endLat)
						$('.storeName div>.title').html(datas[i].name);
						$('.location').html(datas[i].address);
						$('.storeName .phone').attr('href', 'tel:' + datas[i].phone);
						// 根据起终点经纬度规划步行导航路线

						walking.search([startLng, startLat], [endLng, endLat]);
						//  $('.storeName .map').attr('href',`http://uri.amap.com/navigation?from=${startLng},${startLat}&to=${endLng},${endLat}&mode=walk&policy=1&src=mypage&coordinate=gaode&callnative=0`);
						$('.storeName .map').click(() => {
							walking.searchOnAMAP({
								origin: [startLng, startLat],
								destination: [endLng, endLat]
							})
						})
					})
					map.add(marker);
				}
			}
		})

	}
}