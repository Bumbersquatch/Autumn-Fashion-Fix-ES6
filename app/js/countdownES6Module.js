import variables from '../scss/_variables.scss';
import moment from 'moment';

const VanillaCountdown = {
    init() {
        const _this = this;
        const source = document.getElementById('countdown').innerHTML;
        const template = Handlebars.compile(source);
        let data = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            variables,
            daysSVG: '',
            hoursSVG: '',
            minutesSVG: '',
            secondsSVG: ''
        }

        setInterval(() => {
            const then = moment('23-09-2020', 'DD-MM-YYYY');
            const now = moment();
            const countdown = moment(then - now);
            data.days = then.diff(now, 'days');
            data.hours = countdown.format('HH');
            data.minutes = countdown.format('mm');
            data.seconds = countdown.format('ss');

            const daysRadius = this.mapNumber(data.days, 365, 0, 0, 360);
            const hoursRadius = this.mapNumber(data.hours, 24, 0, 0, 360);
	        const minutesRadius = this.mapNumber(data.minutes, 60, 0, 0, 360);
	        const secondsRadius = this.mapNumber(data.seconds, 60, 0, 0, 360);

            let html = template(data);
            document.getElementById('countdown-container').innerHTML = html;

            setTimeout(() => {
                const el = document.querySelector('.countdown-item');
                if (el) {
                const cdidiameter = el.clientWidth / 2;
                
                data.daysSVG = _this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, daysRadius);
                data.hoursSVG = _this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, hoursRadius);
                data.minutesSVG = _this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, minutesRadius);
                data.secondsSVG = _this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, secondsRadius);
                
                html = template(data);
                document.getElementById('countdown-container').innerHTML = html;
                }
            }, 1);
        }, 1000);
    },

    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
      
        return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
        };
    },

    describeArc(x, y, radius, startAngle, endAngle){

        var start = this.polarToCartesian(x, y, radius, endAngle);
        var end = this.polarToCartesian(x, y, radius, startAngle);
    
        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
        var d = [
            "M", start.x, start.y, 
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    
        return d;       
    },

    mapNumber(number, in_min, in_max, out_min, out_max) {
        return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
}

export default VanillaCountdown;