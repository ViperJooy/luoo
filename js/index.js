$(function() {
    var playerTrack = $("#player-track"),
        bgArtwork = $('#bg-artwork'),
        bgArtworkUrl,
        luooName = $('#luooName'),
        luooArtist = $('#luooArtist'),
        luooAlbum = $('#luooAlbum'),
        luooVol = $('#luooVol'),
        luooJournal = $('#luooJournal'),
        albumArt = $('#album-art'),
        sArea = $('#s-area'),
        seekBar = $('#seek-bar'),
        trackTime = $('#track-time'),
        insTime = $('#ins-time'),
        sHover = $('#s-hover'),
        playPauseButton = $("#play-pause-button"),
        i = playPauseButton.find('i'),
        tProgress = $('#current-time'),
        tTime = $('#track-length'),
        seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0,
        buffInterval = null,
        tFlag = false,
        albumArtworks = ['images/luoo.jpg'],
        playPreviousTrackButton = $('#play-previous'),
        playNextTrackButton = $('#play-next'),
        songId,
        songUrl,
        currIndex = -1;

    function playPause() {
        setTimeout(function() {
            if (audio.paused) {
                playerTrack.addClass('active');
                albumArt.addClass('active');
                checkBuffering();
                i.attr('class', 'fas fa-pause');
                audio.play();
            } else {
                playerTrack.removeClass('active');
                albumArt.removeClass('active');
                clearInterval(buffInterval);
                albumArt.removeClass('buffering');
                i.attr('class', 'fas fa-play');
                audio.pause();
            }
        }, 300);
    }


    function showHover(event) {
        seekBarPos = sArea.offset();
        seekT = event.clientX - seekBarPos.left;
        seekLoc = audio.duration * (seekT / sArea.outerWidth());

        sHover.width(seekT);

        cM = seekLoc / 60;

        ctMinutes = Math.floor(cM);
        ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if ((ctMinutes < 0) || (ctSeconds < 0))
            return;

        if (ctMinutes < 10)
            ctMinutes = '0' + ctMinutes;
        if (ctSeconds < 10)
            ctSeconds = '0' + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds))
            insTime.text('--:--');
        else
            insTime.text(ctMinutes + ':' + ctSeconds);

        insTime.css({
            'left': seekT,
            'margin-left': '-21px'
        }).fadeIn(0);

    }

    function hideHover() {
        sHover.width(0);
        insTime.text('00:00').css({
            'left': '0px',
            'margin-left': '0px'
        }).fadeOut(0);
    }

    function playFromClickedPos() {
        audio.currentTime = seekLoc;
        seekBar.width(seekT);
        hideHover();
    }

    function updateCurrTime() {
        nTime = new Date();
        nTime = nTime.getTime();

        if (!tFlag) {
            tFlag = true;
            trackTime.addClass('active');
        }

        curMinutes = Math.floor(audio.currentTime / 60);
        curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

        durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);

        playProgress = (audio.currentTime / audio.duration) * 100;

        if (curMinutes < 10)
            curMinutes = '0' + curMinutes;
        if (curSeconds < 10)
            curSeconds = '0' + curSeconds;

        if (durMinutes < 10)
            durMinutes = '0' + durMinutes;
        if (durSeconds < 10)
            durSeconds = '0' + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds))
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes + ':' + curSeconds);

        if (isNaN(durMinutes) || isNaN(durSeconds))
            tTime.text('00:00');
        else
            tTime.text(durMinutes + ':' + durSeconds);

        if (isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds))
            trackTime.removeClass('active');
        else
            trackTime.addClass('active');


        seekBar.width(playProgress + '%');

        if (playProgress == 100) {
            i.attr('class', 'fa fa-play');
            seekBar.width(0);
            tProgress.text('00:00');
            albumArt.removeClass('buffering').removeClass('active');
            clearInterval(buffInterval);
        }
    }

    function checkBuffering() {
        clearInterval(buffInterval);
        buffInterval = setInterval(function() {
            if ((nTime == 0) || (bTime - nTime) > 1000)
                albumArt.addClass('buffering');
            else
                albumArt.removeClass('buffering');

            bTime = new Date();
            bTime = bTime.getTime();

        }, 100);
    }

    //获取歌单列表
    function getPlayList(pid) {
        var result = pid;
        $.ajax({
            url: 'https://charger.yiqipower.com/music/playlist/detail',
            dataType: 'json',
            data: { id: pid },
            cache: false,
            async: false,
            success: function(data) {
                if (data.code == 200) {
                    result = data.playlist.trackIds // 注意这里不可以在前面加var 关键字
                }

            }
        })
        return result;
    }

    var viperList = getPlayList(43032291)

    // (jquery)封装Promise对象和ajax过程
    var ajaxPromiseGet = function(param) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: param.url,
                type: 'get',
                data: param.data || '',
                success: function(data) {
                    resolve(data);
                },
                error: function(error) {
                    reject(error)
                }
            });
        });
    };


    function selectTrack2(flag) {
        var randomItemId = viperList[Math.floor(Math.random() * viperList.length)].id;
        //获取viper的歌单列表,id = 歌单id
        var detail = ajaxPromiseGet({
            url: 'https://charger.yiqipower.com/music/song/detail',
            data: { ids: randomItemId }
        });

        // 根据歌曲id获取歌曲详情
        detail.then(function(detail) {
                change(detail)
            })
            .catch(function(err) {
                console.log(err);
            });


        function change(detail) {

            $.ajax({
                url: 'https://charger.yiqipower.com/music/song/url',
                dataType: 'json',
                data: {
                    id: detail.songs[0].id
                },
                success: function(data) {
                    if (data.code == 200) {
                        if (data.data[0].url == null) {
                            selectTrack2(1)
                        } else {
                            songUrl = data.data[0].url
                        }

                    }

                }
            })


            if (flag == 0)
                i.attr('class', 'fa fa-play');
            else {
                albumArt.removeClass('buffering');
                i.attr('class', 'fa fa-pause');
            }

            seekBar.width(0);
            trackTime.removeClass('active');
            tProgress.text('00:00');
            tTime.text('00:00');

            currName = detail.songs[0].name;
            currArtist = detail.songs[0].ar[0].name;
            currAlbum = detail.songs[0].al.name;
            currVol = detail.songs[0].v;
            currJournal = detail.songs[0].id;
            currArtwork = detail.songs[0].al.picUrl;
            songUrl = "https://music.163.com/song/media/outer/url?id=" + detail.songs[0].id + ".mp3";
            audio.src = songUrl
            songId = currJournal

            nTime = 0;
            bTime = new Date();
            bTime = bTime.getTime();

            if (flag != 0) {
                audio.play();
                playerTrack.addClass('active');
                albumArt.addClass('active');

                clearInterval(buffInterval);
                checkBuffering();
            }

            luooName.text(currName);
            luooArtist.text(currArtist);
            luooAlbum.text(currAlbum);
            luooVol.text(currVol);
            luooJournal.text(currJournal);

            albumArt.find('img.active').removeClass('active');
            $('#album-pic').addClass('active');

            $('#album-pic').attr('src', currArtwork);

            bgArtwork.css({
                'background-image': 'url(' + currArtwork + ')'
            });

        }
    }



    function initPlayer() {
        audio = new Audio();

        selectTrack2(0);

        audio.loop = false;

        playPauseButton.on('click', playPause);

        sArea.mousemove(function(event) {
            showHover(event);
        });

        sArea.mouseout(hideHover);

        sArea.on('click', playFromClickedPos);

        $(audio).on('timeupdate', updateCurrTime);

        playPreviousTrackButton.on('click', function() {
            // if (audio.currentTime <= 30) {alert("当前音乐播放时间未超过30秒！/n Please try again 30 seconds later!");return false;}
            selectTrack2(-1);
        });
        playNextTrackButton.on('click', function() {
            // if (audio.currentTime <= 30) {alert("当前音乐播放时间未超过30秒！/n Please try again 30 seconds later!");return false;}
            selectTrack2(1);
        });
        audio.addEventListener("ended", function() {
            selectTrack2(1);
        });

        $("#download").click(function() {
            if (window.confirm('是否下载此歌曲')) {
                var url = songUrl.replace("http", "https")　
                saveAs(url, luooName.text());
                return true;
                // $.ajax({
                //     url: 'https://charger.yiqipower.com/music/song/url',
                //     dataType: 'json',
                //     data: {
                //         id: songId
                //     },
                //     success: function(data) {
                //         if (data.code == 200) {
                //             var url = data.data[0].url
                //             var url = url.replace("http", "https")　
                //             saveAs(url, luooName.text());
                //         }

                //     }
                // })
                // return true;
            } else {
                return false;
            }


        });
    }

    initPlayer();

    document.body.onkeyup = function(e) { //亦可绑定到audio，当鼠标点击到audio之后再按键可触发
        var event = e || window.event;
        console.log('keyCode : ' + event.keyCode);
        console.log('volume : ' + audio.volume);
        if (!arguments.callee.pause) {
            arguments.callee.pause = false;
        }
        if (event.keyCode == 40) { //下
            try {
                audio.volume -= 0.1;
            } catch (e) {
                console.log('audio.volume is already the smallest : ' + audio.volume);
            }
        } else if (event.keyCode == 38) { //上
            try {
                audio.volume += 0.1;
            } catch (e) {
                console.log('audio.volume is already the largest : ' + audio.volume);
            }
        } else if (event.keyCode == 39) { //右
            audio.currentTime += 10;
        } else if (event.keyCode == 37) { //左
            audio.currentTime -= 10;
        } else if (event.keyCode == 13) { //Enter下一首
            // if (audio.currentTime <= 30) { alert("当前音乐播放时间未超过30秒！/n Please try again 30 seconds later!"); return false; }
            return new selectTrack2(1);
        } else if (event.keyCode == 32) {
            if (!arguments.callee.pause) {
                arguments.callee.pause = true;
                playPause(); //audio.pause();
            } else {
                arguments.callee.pause = false;
                playPause(); //audio.play();
            }
        }
        console.log('currentTime : ' + audio.currentTime);
    };


});