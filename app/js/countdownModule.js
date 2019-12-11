import '../js/plugin/jquery.final-countdown.min.js';
import variables from '../scss/_variables.scss';

//fix for the final countdown jQuery 3.0.0+ breaks it
jQuery.fn.load = function(callback){ $(window).on("load", callback) };

const countdownModule = {
    init(){
        let date;
        if (!Date.now) {
            date = function () { return new Date().getTime(); }
        } else {
            date = Date.now();
        }
        const borderColor = variables.accentcolor;
        const borderWidth = 5
        $('.countdown').final_countdown({
            start: '1569196800',
            end: '1600819200',
            'now': Math.floor(date / 1000),
            seconds: {
                borderColor: borderColor,
                borderWidth: borderWidth
            },
            minutes: {
                borderColor: borderColor,
                borderWidth: borderWidth
            },
            hours: {
                borderColor: borderColor,
                borderWidth: borderWidth
            },
            days: {
                borderColor: borderColor,
                borderWidth: borderWidth
            }
        });
    }
}

export default countdownModule;