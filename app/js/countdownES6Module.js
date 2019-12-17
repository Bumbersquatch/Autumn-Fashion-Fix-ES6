import variables from '../scss/_variables.scss';
import moment from 'moment';

const VanillaCountdown = {
    init() {
        this.registerHelpers();
        const source = document.getElementById('countdown').innerHTML;
        const template = Handlebars.compile(source);
        let data = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            variables,
            loaded: false,
            daysSVG: 'M -1.988435813787904 0.2147626933283259 A -2 -2 0 0 0 -1.2246467991473532e-16 2',
            hoursSVG: [],
            minutesSVG: [],
            secondsSVG: '',
            daysRadius: 0
        }
        
        
        
        setInterval(() => {
            const then = moment('23-09-2020', 'DD-MM-YYYY');
            const now = moment();
            const countdown = moment(then - now);
            data.days = then.diff(now, 'days');
            data.hours = countdown.format('HH');
            data.minutes = countdown.format('mm');
            data.seconds = countdown.format('ss');

            data.daysRadius = this.mapNumber(data.days, 365, 0, 0, 360);
            const hoursRadius = this.mapNumber(data.hours, 24, 0, 0, 360);
	        const minutesRadius = this.mapNumber(data.minutes, 60, 0, 0, 360);
	        const secondsRadius = this.mapNumber(data.seconds, 60, 0, 0, 360);

            // data.daysSVG = this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, daysRadius);
            // data.hoursSVG = this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, hoursRadius);
            // data.minutesSVG = this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, minutesRadius);
            // data.secondsSVG = this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, secondsRadius);

            let html = template(data);
            document.getElementById('countdown-container').innerHTML = html;
        }, 1000)
    },

    registerHelpers() {
        Handlebars.registerHelper('svgPath', function (radius) {
            const el = document.getElementById('countdown-container').innerHTML;
            console.log(el);
            const ci = el.getElementsByClassName('countdown-item');
            console.log('countdown item', ci);
            const diameter = ci[0].clientWidth;
            const cdidiameter = diameter / 2;
            return this.describeArc(cdidiameter, cdidiameter, cdidiameter-2, 0, radius);
        });
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