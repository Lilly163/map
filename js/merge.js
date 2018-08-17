
var map = new AMap.Map('container', {
	resizeEnable: true,
	zoom: 16 //级别
});
function showMask(content){
	$("#mask").css("height",$(document).height());
	$("#mask").css("width",$(document).width());
	$(".mask_content").html( content )
	$('#mask_button').show()
	$("#mask").show();
}
//隐藏遮罩层
function hideMask(){
	$('#mask_button').hide()
	$("#mask").hide();
}
function show_hide(content,time){
	showMask(content)
	setTimeout( hideMask,time )
}
$("#keyword").on("input",function(e){
	$('.detail').css('display', 'none');
});
showMask()
//地理编码插件，用于通过坐标获取地址信息
var geocoder = new AMap.Geocoder();
//添加定位组件，用于获取用户当前的精确位置
var geolocation = new AMap.Geolocation({
	enableHighAccuracy: true,
	showCircle: true, //是否显示定位结果的圆
	showMarker: true, //是否显示定位结果的标记
	showButton: false, //是否现实组件的定位按钮
	timeout: 5000 //浏览器定位超时时间5s

});
function getCity(lnglatXY) {
	return new Promise(function (reslove, reject) {
		var newcity = '';
		AMap.service('AMap.Geocoder', function () {
			//实例化Geocoder
			geocoder = new AMap.Geocoder({
				city: "" //城市，默认：“全国”
			});
			geocoder.getAddress(lnglatXY, function (status, result) {
				if (status === 'complete' && result.info === 'OK') {
					newcity = result.regeocode.addressComponent.city || result.regeocode.addressComponent.province;
					reslove(newcity);
				} else {
					show_hide('该地区暂不支持',2000)
				}
			});
		});
	});
}
function ajaxCity(startLng,startLat,lnglatXY){
	getCity(lnglatXY).then(function (city) {
		$.ajax({
			url: 'http://101.201.108.106:8127/findAdminStroe?city=' + city,
			dataType: 'json',
			success: function success(data) {
				var datas = data.data;
				var lnglats = [];
				datas.map(function (value, index) {
					lnglats.push([value.longitude, value.latitude]);
				});

				var _loop = function _loop(i, _marker) {
					_marker = new AMap.Marker({
						position: lnglats[i],
						map: map,
						icon: new AMap.Icon({
							image: './images/result.png',
							size: new AMap.Size(40, 45), //图标大小
							imageSize: new AMap.Size(40, 45)
						})
					});
					walking = new AMap.Walking({
						map: map,
						autoFitView: true
					});
					_marker.on('click', function markerClick(e) {
						console.log(lnglats[i])
						$('.detail').css('display', 'block');
						walking.clear(); //清除上一次规划路线
						// var endLng = e.lnglat.lng;
						// var endLat = e.lnglat.lat;
						var endLng = lnglats[i][0];   //更换终点坐标
						var endLat = lnglats[i][1];   //更换终点坐标
						console.log(startLng, startLat, endLng, endLat);
						$('.storeName div>.title').html(datas[i].name);
						$('.location').html(datas[i].address);
						$('.storeName .phone').attr('href', 'tel:' + datas[i].phone);
						walking.search([startLng, startLat], [endLng, endLat]);
						$('.storeName .map').click(function () {
							walking.searchOnAMAP({
								origin: [startLng, startLat],
								destination: [endLng, endLat]
							});
						});
					});
					map.add(_marker);
					marker = _marker;
				};

				for (var i = 0, marker; i < lnglats.length; i++) {
					var walking;
					_loop(i, marker);
				}
			}
		});
	});
}
map.addControl(geolocation);
geolocation.getCurrentPosition();
AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息

function onComplete(data) {
	hideMask()
	var startLng = Math.abs(data.position.lng);
	var startLat = Math.abs(data.position.lat);
	var lnglatXY = [startLng, startLat];
  ajaxCity(startLng,startLat,lnglatXY)
};

function onError(data) {
	// 定位出错
	if (data.message.indexOf('Geolocation permission denied.') !== -1) {
	     show_hide('<p>定位失败！</p>请打开浏览器定位权限',2500)
	} else {
		show_hide('<p>无法获取精确位置</p>请尝试刷新或搜索',2500)
	}
	onLocateFailed();
};

//定位失败之后进行城市定位
var onLocateFailed = function onLocateFailed() {
	geolocation.getCityInfo(function (status, result) {
		map.setZoom(14);
		// showLocation(result.center); //在城市中心点显示起始marker
		// PlaceSearch.setCity(result.citycode);
		// autoComplete.setCity(result.citycode);
	});
};
//定位成功
var onLocateSuccess = function onLocateSuccess(result) {
	// showLocation(result.position); //在定位结果显示起始marker
	var city = result.addressComponent.city;
	var province = result.addressComponent.province;
	var district = result.addressComponent.district;
	var township = result.addressComponent.township;
	showOriginAddress(result.formattedAddress.replace(province, '').replace(city, '').replace(district, '').replace(township, ''));
	origin.position = result.position;
	placeSearch.setCity(result.addressComponent.citycode);
	autoComplete.setCity(result.addressComponent.citycode);
};
var searchInput = document.getElementById('keyword');
var city = "";
//输入提示组件，在searchInput输入文字后，将自动显示相关的地点提示
var autoComplete = new AMap.Autocomplete({
	input: searchInput,
	citylimit: true,
	noshowDistrict: true
});
var placeSearch = new AMap.PlaceSearch({
	map: map
}); //构造地点查询类
// 点击搜索的时候调用关键字查询函数
$('#searchButton').click(function () {
	placeSearch.search(searchInput.value, function (status, SearchResult) {
		if (status === 'complete') {
			map.clearMap();
			var pois = SearchResult.poiList.pois[0].location;
			var startLng = pois.lng;
			var startLat = pois.lat;
			var lnglatXY = [startLng, startLat];
			map.setZoom(13), map.setCenter(pois);
			var markerNow = new AMap.Marker({
				position: new AMap.LngLat(pois.lng, pois.lat)
			});
			map.add(markerNow);
			ajaxCity(startLng,startLat,lnglatXY)
		} else {
			show_hide('<p>搜索地点不存在,</p><p>请更换搜索关键词</p>',2000)
		}
	});
});

// 选中某一条下拉提示时触发
AMap.event.addListener(autoComplete, "select", select); //注册监听，当选中某条记录时会触发
function select(e) {
	map.clearMap();
	var startLng = e.poi.location.lng;
	var startLat = e.poi.location.lat;
	var lnglatXY = [startLng, startLat];
	// 获取当前城市
	if (e.poi && e.poi.location) {
		map.setZoom(13), map.setCenter(e.poi.location);
		var markerNow = new AMap.Marker({
			position: new AMap.LngLat(e.poi.location.lng, e.poi.location.lat)
		});
		map.add(markerNow);
		ajaxCity(startLng,startLat,lnglatXY)
	}
}
