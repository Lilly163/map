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
	map
});
var walking = new AMap.Walking({
    map,
    autoFitView:true,
   }); 
}

function getPositionInfo(city) {
    return new Promise(function (reslove,reject){
        $.ajax({
            url:'../data/mock.json?city=' + city,
            dataType:'json',
            success:(data)=>{
              reslove(data.data)},
            error: (err) => {
              reject(err)
            }
            })
        })
    }

    getPositionInfo('北京').then(response => {
      var lnglats = response.map((val,idx) =>{
          return [val.longitude, val.latitude]
      })

      for (let i in lnglats) {
       new AMap.Marker({
            position:lnglats[i],
            map,
            icon: './images/result.png', 
    }).on('click',function markerClick(e){ 
        $('.detail').css('display','block');
        walking.clear();  //清除上一次规划路线
        let endLng = e.lnglat.lng;
        let endLat = e.lnglat.lat;
        const {name, address, phone} = lnglats[i]
        $('.storeName div>.title').html(name);
        $('.location').html(address);a
        $('.storeName .phone').attr('href','tel:'+ phone);

        walking.search([startLng,startLat], [endLng,endLat]);

        $('.storeName .map').click(()=>{
            walking.searchOnAMAP({
                origin:[startLng,startLat],
                destination:[endLng,endLat]
            })
        })
    })
   map.add(marker)


    })