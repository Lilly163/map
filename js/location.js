var map = new AMap.Map('container', {
	resizeEnable: true,
	zoom:17,//级别
});
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
	map.addControl(geolocation);
	geolocation.getCurrentPosition();
	AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
	// AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
	function onComplete (data) {
		let startLng = Math.abs(data.position.lng);
		let startLat = Math.abs(data.position.lat);
		$.ajax({
			url:'../data/mock.json',
			type:'GET',
			data:{'lng':startLng,'lat':startLat},
			dataType:'json',
			success:(data)=>{
			   let datas = data.data;
			   let lnglats = [];
			   datas.map((value,index)=>{
				 lnglats.push([value.longitude,value.latitude])
			   })
			   for(let i = 0, marker ; i < lnglats.length; i++){
				   marker=new AMap.Marker({
						   position:lnglats[i],
						   map:map,
						   icon: './images/result.png', // 添加 Icon 图标 URL
				   }); 
				   var walking = new AMap.Walking({
					map: map,
					autoFitView:true,
				   }); 
				   marker.on('click',function markerClick(e){
					walking.clear();  //清除上一次规划路线
					let endLng = e.lnglat.lng;
					let endLat = e.lnglat.lat;
					console.log(startLng,startLat,endLng,endLat)
					$('.storeName div>.title').html(datas[i].name);
					$('.location').html(datas[i].address);
					$('.storeName .phone').attr('href','tel:'+datas[i].phone);
                    //进行路线规划，并对返回信息进行处理    
					walking.search([startLng,startLat], [endLng,endLat],function(){
						
					});
					
	
					//  $('.storeName .map').attr('href',`http://uri.amap.com/navigation?from=${startLng},${startLat}&to=${endLng},${endLat}&mode=walk&policy=1&src=mypage&coordinate=gaode&callnative=0`);
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
    }
	
	//   function onError (data) {
	// 	// 定位出错
	// 	if (data.message.indexOf('Geolocation permission denied.') !== -1) {
	// 		//Geolocation permission denied.表示用户禁用了浏览器或者APP的定位权限或者关闭了手机的定为服务
	// 		//或者当前页面为非安全页面,Chrome或者IOS10等系统会禁用非安全页面的定位请求，如果您的页面还没有支持HTTPS请尽快升级
	// 		//安全页面指的是支持HTTPS的Web站点，而且是通过https协议打开的页面。安全页面也包括本地页面
	// 		$('.detail').css('paddingTop','1.2rem').html('您好，请在系统的隐私设置中打开当前应用的定位权限。');
	// 	} else {
	// 		$('.detail').css('paddingTop','1.2rem').html('无法获取精确位置,将定位您所在的城市。');
	// 	}
	// 	onLocateFailed();
	//   }
//  var startLocate = function() {
//  	document.getElementById('locating').style.display = 'block';
//  	geolocation.getCurrentPosition(function(status, result) {
//  		if (status == 'complete') {
//  			onLocateSuccess(result) //定位成功
//  		} else if (status == 'error') {
//  			//定位失败
//  			if (result.message.indexOf('Geolocation permission denied.') !== -1) {
//  				//Geolocation permission denied.表示用户禁用了浏览器或者APP的定位权限或者关闭了手机的定为服务
//  				//或者当前页面为非安全页面,Chrome或者IOS10等系统会禁用非安全页面的定位请求，如果您的页面还没有支持HTTPS请尽快升级
//  				//安全页面指的是支持HTTPS的Web站点，而且是通过https协议打开的页面。安全页面也包括本地页面
//  				// showTip('您好，请在系统的隐私设置中打开当前应用的定位权限。');
//  			} else {
//  				// showTip('无法获取精确位置,将定位您所在的城市。');
//  			}
//  			// onLocateFailed();
//  		}
//  	})
//  };

 //定位失败之后进行城市定位
//  var onLocateFailed = function() {
//  	geolocation.getCityInfo(function(status, result) {
//  		map.setZoom(14);
//  		showLocation(result.center); //在城市中心点显示起始marker
//  		// PlaceSearch.setCity(result.citycode);
//  		// autoComplete.setCity(result.citycode);
//  	})
//  };
 //定位成功
 var onLocateSuccess = function(result) {
 	showLocation(result.position); //在定位结果显示起始marker
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