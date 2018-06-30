var searchInput = document.getElementById('keyword');
//输入提示组件，在searchInput输入文字后，将自动显示相关的地点提示
var autoComplete = new AMap.Autocomplete({
	input: searchInput,
	citylimit: true,
	noshowDistrict: true
});
//点击搜索按钮的时候执行关键字搜索

var auto = new AMap.Autocomplete(autoComplete);
var placeSearch = new AMap.PlaceSearch({
	map: map
});  //构造地点查询类
AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
function select(e) {
	map.clearMap();
	let startLng = e.poi.location.lng;
	let startLat = e.poi.location.lat;
	// document.getElementById('mask').style.display = 'block';
	 console.log(e.poi.location)
	 let start 
     if( e.poi && e.poi.location ){
		 map.setZoom(15),
		 map.setCenter(e.poi.location)
		 var markerNow = new AMap.Marker({
			position: new AMap.LngLat(e.poi.location.lng,e.poi.location.lat)
		 });
		 map.add(markerNow);
		 $.ajax({
			 url:'../data/mock.json',
			 type:'GET',
			 data:{'lng':e.poi.location.lng,'lat':e.poi.location.lat},
			 dataType:'json',
			 success:(data)=>{
				let datas = data.data;
				let lnglats = [];
				datas.map((value,index)=>{
				  lnglats.push([value.longitude,value.latitude])
				})
				// console.log(lnglats)
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
						// 根据起终点经纬度规划步行导航路线
				
						walking.search([startLng,startLat], [endLng,endLat]);
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
}

