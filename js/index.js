$(function () {


    //活动详情
    $('.look').click(function () {
        $('.detail').fadeIn();
        $('body').css('overflow', 'hidden');
        $('html').css('overflow', 'hidden');
    });
    $('.detail').click(function () {
        $(this).fadeOut();
        $('body').css('overflow', 'visible')
        $('html').css('overflow', 'visible')
    });

    // 获取验证码
    $('.Obtain').click(function () {
        let phone = $('.phoneNumber').val();
        if (!(/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/.test(phone))) {
            toast("请输入正确手机号码");
            return false;
        } else {
            $.post('http://test.mydaodao.com/index.php?s=/api/hx.hs/sms', {
                phone: phone
            }, function (data, status) {
                if (data.code == 1) {
                    toast('验证码已发送');
                    var code = $('.Obtain');
                    code.attr("disabled", "disabled");
                    var time = 60;
                    var set = setInterval(function () {
                        code.val(--time + 'S');
                    }, 1000);
                    setTimeout(function () {
                        code.attr("disabled", false).val("获取");
                        clearInterval(set);
                    }, 60000);
                } else if (data.code == 0) {
                    toast('验证码发送失败');
                } else if (data.code == -1) {
                    toast('发送过于频繁');
                };
            }, 'json')
        }
    });


    //登录
    $('.determine').click(function () {
        let phone = $('.phoneNumber').val(),
            verify = $('.verificationNumber').val();
        if (phone == '' || verify == '') {
            toast('请输入完整信息')
        } else {
            $.post('http://test.mydaodao.com/index.php?s=/api/hx.hs/form', {
                phone: phone,
                verify: verify,
                openid: 'o1kQ-5RqBfUXMoYG3krQemAFJY6A'
            }, function (res) {
                if (res.code == 1) {
                    toast('登录成功');
                    $(".shade").fadeOut();
                    let content = JSON.stringify(res.data);
                    $.cookie('userinfo', content, {
                        expires: 30
                    });
                    vote();
                } else if (res.code == 0) {
                    toast('登录失败');
                }
            }, 'json')
        }

    })



    function load() {
        if ($.cookie('userinfo')) {
            toast('欢迎回来十二花神');
        } else {
            toast('请登录后阅览');
        }
        $.getJSON('http://test.mydaodao.com/index.php?s=/api/hx.hs/lists', function (res) {
            let con = res.data;
            for (i in con) {
                for (let s = 0; s < con[i].length; s++) {
                    $('#swiper-container3 .swiper-slide').eq(i - 1).append(`<div class="content">
                    <section class="flower">
                        <header class="title">
                            <h3>${con[i][s].title}</h3>
                            <p>当前票数：<span>${con[i][s].votes}</span></p>
                        </header>
                        <img src="${con[i][s].image.thumb_file_path}" data-backup='${con[i][s].image.file_path}' alt="" srcset="" class="image">
                        <input type="button" value="投票" class="vote" data-category="${con[i][s].hs_category_id}" data-id="${con[i][s].hs_id}" />
                    </section>
                    </div>`);
                }
            };
            vote();
        });
    }
    load();

    //已投票
    function vote() {

        if ($.cookie('userinfo')) {
            let userinfo = $.cookie('userinfo'),
                phone = JSON.parse(userinfo).phone;
            $.getJSON('http://shop.mydaodao.com/index.php?s=/api/hx.hs/vote_status', {
                phone: phone
            }, function (res) {
                let id = res.data;
                for (let i = 0; i < id.length; i++) {
                    $(".vote[data-id = '" + res.data[i].hs_id + "']").val('已投票').css('background', '#fffab5');
                }
            })
        } else {}

    }

    var mySwiper2 = new Swiper('#swiper-container2', {
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        slidesPerView: 4,
        spaceBetween: 20,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            tap: function () {
                mySwiper3.slideTo(mySwiper2.clickedIndex)
            }
        }
    })
    var height = $('#swiper-container2 .swiper-slide').width();
    // console.log(fsd)
    $('#swiper-container2 .swiper-slide').css({
        'height': height + 'px',
        'line-height': height + 'px'
    });
    var mySwiper3 = new Swiper('#swiper-container3', {
        autoHeight: true,
        on: {
            slideChangeTransitionStart: function () {
                updateNavPosition()
            }
        }

    });

    function updateNavPosition() {
        $('#swiper-container2 .active-nav').removeClass('active-nav')
        var activeNav = $('#swiper-container2 .swiper-slide').eq(mySwiper3.activeIndex).addClass('active-nav');
        if (!activeNav.hasClass('swiper-slide-visible')) {
            if (activeNav.index() > mySwiper2.activeIndex) {
                var thumbsPerNav = Math.floor(mySwiper2.width / activeNav.width()) - 1
                mySwiper2.slideTo(activeNav.index() - thumbsPerNav)
            } else {
                mySwiper2.slideTo(activeNav.index())
            }
        }
    }

    // 投票
    $(document).on('click', '.vote', function () {
        let category = $(this).attr('data-category'),
            hs_id = $(this).attr('data-id'),
            vote = $(this).siblings('.title').find('span'),
            number = Number(vote.text());
        if ($.cookie('userinfo')) {
            if ($.cookie(category)) {
                toast('该月份的花神已投票！');
            } else {
                $.post("http://test.mydaodao.com/index.php?s=/api/hx.hs/vote", {
                    hs_id: hs_id
                }, function (res) {
                    if (res.code == 1) {
                        vote.text(number += 1);
                        lastTime(category, hs_id);
                        toast('本月花神投票成功！');
                        $(this).val('已投票').css('background', '#fffab5');
                    } else if (res.code == 0) {
                        toast('本月花神投票失败！')
                    } else if (res.code == -9) {
                        toast('请先登录');
                    }
                }, "json");
            }
        } else {
            toast('请先登录');
            $('.shade').fadeIn();
        }




    });

    //过期时间
    function lastTime(category, hs_id) {
        //当前时间
        let date = new Date(),
            //当前时间戳
            time = date.getTime(),
            //当天凌晨时间
            WeeHours = new Date(date.toLocaleDateString()).getTime() - 1,
            //当天剩余时间
            passedTamp = 24 * 60 * 60 * 1000 - (time - WeeHours),
            // 重新创建当天时间
            leftTime = new Date();
        //当天最晚时间时间戳
        leftTime.setTime(passedTamp + time);

        $.cookie(category, hs_id, {
            expires: leftTime
        })
    };

    // 上月份
    $('.up,.left').click(function () {
        mySwiper3.slidePrev();
    });
    // 下月份
    $('.down,.right').click(function () {
        mySwiper3.slideNext();
    });

    //点击预览大图
    $(document).on('click', '.image', function () {
        let img = $(this).attr('data-backup');
        $('body').css('overflow', 'hidden');
        $('.preview').fadeIn().children().attr('src', img);
    });

    //取消预览大图
    $(document).on('click', '.preview', function () {
        $('.preview').fadeOut().children().removeAttr('src');
        $('body').css('overflow', 'auto');
    });

    //提示
    function toast(content) {
        $('.toast').remove();
        $('.container').append(`<span class="toast">${content}</span>`);
        setTimeout(() => {
            $('.toast').remove();
        }, 2000);
    };

})