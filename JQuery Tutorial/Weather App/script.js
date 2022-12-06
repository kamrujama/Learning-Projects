$(document).ready(function(){

  $('.box1').css({'height':'400px', 'width':'500px','background-color':'limegreen','color':"white", 'z-index':'-19'})
 
  $(document).mousemove(function(event){
    $('.box1').text("X-axis : "+ event.pageX + "  Y-axis : "+event.pageY)
    let x = event.pageX
    let y = event.pageY
    $(".box2").css({'height':'400px', 'width':'500px','background-color':'red','z-index':'10'})
    $('.box2').offset({top:y, left:x})
  })

   let city = $('#search').text()
   $('#searchBtn').click(function(){
    $(this).css('background-color','red')
    $(this).text('clicked')
   })
  
})