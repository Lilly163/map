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
	getCity(lnglatXY).then(city => { 
            $.ajax({
				url: 'http://101.201.108.106:8127/findAdminStroe?city=' + city,
				dataType: 'json',
				success: (data) => {
					console.log(data)
				   let datas = data.data;
				   let lnglats = [];
				   datas.map((value,index)=>{
					 lnglats.push([value.longitude,value.latitude])
				   })
				   for(let i = 0, marker ; i < lnglats.length; i++){
					   marker=new AMap.Marker({
							   position:lnglats[i],
							   map:map,
							//    icon: './images/result.png', // 添加 Icon 图标 URL
							icon: new AMap.Icon({            
								image: './images/result.png',
								size: new AMap.Size(40, 40),  //图标大小
								imageSize: new AMap.Size(40,40)
							})           
					   }); 
					   var walking = new AMap.Walking({
						map: map,
						autoFitView:true,
					   }); 
					   marker.on('click',function markerClick(e){
						$('.detail').css('display','block');
						walking.clear();  //清除上一次规划路线
						let endLng = e.lnglat.lng;
						let endLat = e.lnglat.lat;
						console.log(startLng,startLat,endLng,endLat)
						$('.storeName div>.title').html(datas[i].name);
						$('.location').html(datas[i].address);
						   $('.storeName .phone').attr('href', 'tel:' + datas[i].phone);
						   walking.search([startLng, startLat], [endLng, endLat]);   
						//进行路线规划，并对返回信息进行处理    
						$('.storeName .map').click(()=>{
							walking.searchOnAMAP({
								origin:[startLng,startLat],
								destination:[endLng,endLat]
							})
						})
					})
					  map.add(marker);
				  }
				}
			})
		})	
    }
	
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
	  }

 //定位失败之后进行城市定位
 var onLocateFailed = function() {
 	geolocation.getCityInfo(function(status, result) {
 		map.setZoom(14);
 		// showLocation(result.center); //在城市中心点显示起始marker
 		// PlaceSearch.setCity(result.citycode);
 		// autoComplete.setCity(result.citycode);
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

 //显示起始marker，并开启拖拽调整起始位置的功能