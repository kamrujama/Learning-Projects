$(function(){
    // fadeOut makes display none, so it doesn't occupies space

    $('.box-1').fadeOut(1250);
    $('.box-2').fadeOut(1500);
    $('.box-3').fadeOut(1750);
    $('.box-4').fadeOut(2000);

    $('.box-1').fadeIn(1250);
    $('.box-2').fadeIn(1500);
    $('.box-3').fadeIn(1750);
    $('.box-4').fadeIn(2000);

    // fadeTo just make opacity = 0, so it occupies space
    $('.box-1').fadeTo(1250, 0.2);
    $('.box-2').fadeTo(1500, 0.4);
    $('.box-3').fadeTo(1750, 0.6);
    $('.box-4').fadeTo(2000, 0.8);

    // fadeToggle toggles the box ie if faded it will make visible 
    // if visible makes faded
    // $('.box-5').fadeToggle();
    // $('.box-5').fadeToggle();
    // $('.box-5').slideUp(2000)
    // $('.box-5').hide(2000)
    $('.box-5').slideDown(2000)
    // $('.box-5').slideToggle(2000)


    $('.box-6').hide(1000);
    $('.box-6').show(1000);
    // $('.box-6').toggle(1000);

    $("p").hide();
    $("p").slideDown(2000)

    $(".box-7").animate({
        "margin-left" : "+=200px",
        width : "0px",
        height : "0px"
    },1000,"linear");

    // $('.lightbox').hide()

    $(".box-5").click(function(){
        $(this).slideUp(2000);
    })

    $("#show-hide").click(function(){
        $(".box-5").toggle(2000)
    })

    // $(".lightbox").delay(1000).fadeIn(2000)

  });
