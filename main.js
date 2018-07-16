var map = new AMap.Map('container', {
	resizeEnable: true,
	zoom:17,//级别
});
window.dialog =  Dialog.init('正在定位,请稍后')
 //地理编码插件，用于通过坐标获取地址信息
 var geocoder = new AMap.Geocoder();
 //添加定位组件，用于获取用户当前的精确位置
 var geolocation = new AMap.Geolocation({
	 enableHighAccuracy: true,
	 showCircle: true, //是否显示定位结果的圆
	 showMarker: true, //是否显示定位结果的标记
	 showButton: false, //是否现实组件的定位按钮
	 timeout: 5000, //浏览器定位超时时间5s
	 
});
function getCity(lnglatXY) {
	return new Promise(function (reslove, reject) {
	let newcity = '';
	AMap.service('AMap.Geocoder',function(){
		//实例化Geocoder
		geocoder = new AMap.Geocoder({
			city: ""//城市，默认：“全国”
		});
		geocoder.getAddress(lnglatXY, function (status, result) {
			if (status === 'complete' && result.info === 'OK') {
				newcity = result.regeocode.addressComponent.city || result.regeocode.addressComponent.province;
				reslove(newcity)
			}else{
				Dialog.init('该地区暂不支持', 2000);
			}
		});
	 })
	})
}
	map.addControl(geolocation);
	geolocation.getCurrentPosition();
	AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
	AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
function onComplete(data) {
	Dialog.close(dialog);
		let startLng = Math.abs(data.position.lng);
		let startLat = Math.abs(data.position.lat);
		let lnglatXY = [startLng, startLat];
	    getCity(lnglatXY).then(t=>{$.ajax({url:"http://101.201.108.106:8127/findAdminStroe?city="+t,dataType:"json",success:t=>{console.log(t);let a=t.data,e=[];a.map((t,a)=>{e.push([t.longitude,t.latitude])});for(let t,l=0;l<e.length;l++){t=new AMap.Marker({position:e[l],map:map,icon:new AMap.Icon({image:"./images/result.png",size:new AMap.Size(40,45),imageSize:new AMap.Size(40,45)})});var n=new AMap.Walking({map:map,autoFitView:!0});t.on("click",function(t){$(".detail").css("display","block"),n.clear();let e=t.lnglat.lng,i=t.lnglat.lat;console.log(startLng,startLat,e,i),$(".storeName div>.title").html(a[l].name),$(".location").html(a[l].address),$(".storeName .phone").attr("href","tel:"+a[l].phone),n.search([startLng,startLat],[e,i]),$(".storeName .map").click(()=>{n.searchOnAMAP({origin:[startLng,startLat],destination:[e,i]})})}),map.add(t)}}})});
    };
	
function onError (data) {
		// 定位出错
		if (data.message.indexOf('Geolocation permission denied.') !== -1) {
			Dialog.close(dialog);
			Dialog.init('定位失败!请打开浏览器或者APP的定位权限',1800);
		} else {
			Dialog.close(dialog);
			Dialog.init('无法获取精确位置,将定位您所在的城市。',1800);
		}
		onLocateFailed();
	  };

 //定位失败之后进行城市定位
 var onLocateFailed = function() {
 	geolocation.getCityInfo(function(status, result) {
 		map.setZoom(14);
 	})
 };
 //定位成功
 var onLocateSuccess = function(result) {
 	// showLocation(result.position); //在定位结果显示起始marker
 	var city = result.addressComponent.city;
 	var province = result.addressComponent.province;
 	var district = result.addressComponent.district;
 	var township = result.addressComponent.township;
 	showOriginAddress(result.formattedAddress.replace(province, '').replace(city, '').replace(district, '').replace(township, ''))
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
$('#searchButton').click(() => {
	placeSearch.search(searchInput.value, (status, SearchResult) => {
		if (status === 'complete') {
			map.clearMap();
			let pois = SearchResult.poiList.pois[0].location;
			let startLng = pois.lng;
			let startLat = pois.lat;
			let lnglatXY = [startLng, startLat];
			map.setZoom(13),
				map.setCenter(pois)
			var markerNow = new AMap.Marker({
				position: new AMap.LngLat(pois.lng, pois.lat)
			});
			map.add(markerNow);
			getCity(lnglatXY).then(t=>{$.ajax({url:"http://101.201.108.106:8127/findAdminStroe?city="+t,dataType:"json",success:t=>{let a=t.data,e=[];a.map((t,a)=>{e.push([t.longitude,t.latitude])});for(let t,i=0;i<e.length;i++){t=new AMap.Marker({position:e[i],map:map,icon:new AMap.Icon({image:"./images/result.png",size:new AMap.Size(40,45),imageSize:new AMap.Size(40,45)})});var n=new AMap.Walking({map:map,autoFitView:!0});t.on("click",function(t){$(".detail").css("display","block"),n.clear();let e=t.lnglat.lng,l=t.lnglat.lat;console.log(startLng,startLat,e,l),$(".storeName div>.title").html(a[i].name),$(".location").html(a[i].address),$(".storeName .phone").attr("href","tel:"+a[i].phone),n.search([startLng,startLat],[e,l]),$(".storeName .map").click(()=>{n.searchOnAMAP({origin:[startLng,startLat],destination:[e,l]})})}),map.add(t)}}})});
		} else {
			Dialog.init('搜索地点不存在,请更换搜索关键词', 2000);
		}
	});
});

// 选中某一条下拉提示时触发
AMap.event.addListener(autoComplete, "select", select); //注册监听，当选中某条记录时会触发
function select(e) {
	map.clearMap();
	let startLng = e.poi.location.lng;
	let startLat = e.poi.location.lat;
	let lnglatXY = [startLng,startLat];
	// 获取当前城市
	if (e.poi && e.poi.location) {
		map.setZoom(13),
			map.setCenter(e.poi.location)
		var markerNow = new AMap.Marker({
			position: new AMap.LngLat(e.poi.location.lng, e.poi.location.lat)
		});
		map.add(markerNow);
		getCity(lnglatXY).then(t=>{$.ajax({url:"http://101.201.108.106:8127/findAdminStroe?city="+t,dataType:"json",success:t=>{let a=t.data,e=[];a.map((t,a)=>{e.push([t.longitude,t.latitude])});for(let t,i=0;i<e.length;i++){t=new AMap.Marker({position:e[i],map:map,icon:new AMap.Icon({image:"./images/result.png",size:new AMap.Size(40,45),imageSize:new AMap.Size(40,45)})});var n=new AMap.Walking({map:map,autoFitView:!0});t.on("click",function(t){$(".detail").css("display","block"),n.clear();let e=t.lnglat.lng,l=t.lnglat.lat;console.log(startLng,startLat,e,l),$(".storeName div>.title").html(a[i].name),$(".location").html(a[i].address),$(".storeName .phone").attr("href","tel:"+a[i].phone),n.search([startLng,startLat],[e,l]),$(".storeName .map").click(()=>{n.searchOnAMAP({origin:[startLng,startLat],destination:[e,l]})})}),map.add(t)}}})});
	}
}