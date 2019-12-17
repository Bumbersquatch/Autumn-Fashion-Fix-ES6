import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import Layzr from 'layzr.js';
import moment from 'moment';

const PostModule = {
    s: {
        numArticles: 20,
        page: 1,
        postList: document.getElementById('post-list'),
        postItem: document.getElementById('post'),
        moreButton: document.getElementById('loadMoreButton'),
        loading: document.querySelector('.loading'),
        affFilterBtn: document.getElementById('aff-btn'),
        twitterFilterBtn: document.getElementById('twitter-btn'),
        igFilterBtn: document.getElementById('ig-btn'),
        secondaryBtns: document.querySelectorAll('.btn-secondary'),
        currentFilter: null,
        layzr: null,
        masonryContainer: null,
        msnry: null,
        currentData: {},
        template: null
    },

    init() {
        this.bindUIActions();
        this.getMorePosts(this.s.numArticles, this.s.page);
        this.registerHelpers();
        this.initialisePlugins();
    },

    initialisePlugins() {
        const s = this.s;

        // Layzr - Lazy loading Images
        const instance = Layzr({
            normal: 'data-normal'
        });

        instance.update().check().handlers(true);

        instance.on('src:after', () => {
            imagesLoaded(s.masonryContainer, () => {
                s.msnry.layout();
            });
        });

        this.s.layzr = instance;

        //Masonry Initialise
        let msnry = new Masonry(s.postList, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-item:not([style*="display: none"])',
            initLayout: false
        });

        msnry.on('layoutComplete', () => {
            const secondaryBtns = this.s.secondaryBtns;
            s.layzr.update().check();
            if(secondaryBtns.length > 0){
                secondaryBtns.forEach(element => {
                    element.removeAttribute('disabled');
                });
            }
            this.s.moreButton.removeAttribute('disabled');
        });

        this.s.masonryContainer = s.postList;
        this.s.msnry = msnry;
    },

    registerHelpers() {
        Handlebars.registerHelper('eq', function (a, b) {
            let next = arguments[arguments.length - 1];
            return (a === b) ? next.fn(this) : next.inverse(this);
        });

        Handlebars.registerHelper('parseTwitter', function (text) {
            text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
                return '<a href="' + url + '" target="_blank">' + url + '</a>';
            });
            text = text.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
                const username = u.replace('@', '')
                return '<a href="https://twitter.com/' + username + '" target="_blank">' + u + '</a>';
            });
            text = text.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
                const tag = t.replace('#', '%23')
                return '<a href="https://twitter.com/search?q=' + tag + '" target="_blank">' + t + '</a>';
            });

            return text;
        });

        Handlebars.registerHelper('parseInstagram', function (text) {
            text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (url) {
                return '<a href="' + url + '" target="_blank">' + url + '</a>';
            });
            text = text.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
                const username = u.replace('@', '')
                return '<a href="https://instagram.com/' + username + '" target="_blank">' + u + '</a>';
            });
            text = text.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
                const tag = t.replace('#', '')
                return '<a href="https://instagram.com/explore/tags/' + tag + '" target="_blank">' + t + '</a>';
            });

            return text;
        });

        Handlebars.registerHelper('formatDate', function (date_raw) {
            return moment(date_raw).format('dddd DD MMMM YYYY');
        });
    },

    bindUIActions() {
        const _this = this;

        this.s.moreButton.addEventListener('click', function(e){
            e.preventDefault();
            _this.getMorePosts();
        })

        this.s.affFilterBtn.addEventListener('click', function(e){
            e.preventDefault();
            _this.filterPosts('aff', this);
        })

        this.s.twitterFilterBtn.addEventListener('click', function(e){
            e.preventDefault();
            _this.filterPosts('twitter', this);
        })

        this.s.igFilterBtn.addEventListener('click', function(e){
            e.preventDefault();
            _this.filterPosts('ig', this);
        })
    },

    filterPosts(type, btn) {
        const msnry = this.s.msnry;
        const $container = this.s.masonryContainer;
        const currentData = this.s.currentData;
        const secondaryBtns = this.s.secondaryBtns;
        $container.innerHTML = '';
        if (secondaryBtns.length > 0) {
            secondaryBtns.forEach(element => {
                element.setAttribute('disabled', 'disabled');
            });
        }
        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            this.s.currentFilter = null;
            this.createTemplate(currentData);
            msnry.reloadItems();
            msnry.layout();
        } else {
            this.s.currentFilter = type;
            const filterBtns = document.querySelectorAll('.filter-row .btn');
            filterBtns.forEach(element => {
                element.classList.remove('active');
            });
            btn.classList.add('active');
            if (type === 'aff') {
                this.manualFilter(currentData);
            }
            if (type === 'ig') {
                this.instagramFilter(currentData);
            }
            if (type === 'twitter') {
                this.twitterFilter(currentData);
            }
        }
    },

    twitterFilter(data) {
        var newdata = {};
        newdata.items = data.items.filter(function (item) {
            return item.service_slug === 'twitter';
        });
        this.createTemplate(newdata);
    },

    instagramFilter(data) {
        var newdata = {};
        newdata.items = data.items.filter(function (item) {
            return item.service_slug === 'instagram';
        });
        this.createTemplate(newdata);
    },

    manualFilter(data) {
        var newdata = {};
        newdata.items = data.items.filter(function (item) {
            return item.service_slug === 'manual';
        });
        this.createTemplate(newdata);
    },

    createTemplate(data) {
        const msnry = this.s.msnry;
        const source = this.s.postItem.innerHTML;
        const template = Handlebars.compile(source);
        let html = template(data);
        var el = document.createElement('div');
        el.innerHTML = html;
        this.s.masonryContainer.appendChild(el);
        msnry.reloadItems();
        msnry.layout();
        this.s.layzr.update().check();
    },

    getMorePosts() {
        const s = this.s,
            num = this.s.numArticles,
            page = this.s.page;
        const _this = this;
        this.s.loading.style.display = 'block';
        this.s.moreButton.setAttribute('disabled', 'disabled');
        fetch(`https://private-cc77e-aff.apiary-mock.com/posts?page=${page}&numPosts=${num}`)
        .then(data => data.json())
        .then(data => {

            data.items.sort(function (a, b) {
                const dateA = moment(a.item_published),
                    dateB = moment(b.item_published);
                return dateB - dateA;
            });

            //set data
            if (this.s.currentData.items) {
                this.s.currentData.items = [...this.s.currentData.items, ...data.items];
            } else {
                this.s.currentData = data;
            }
            //filter results
            if (s.currentFilter !== null) {
                if (s.currentFilter === 'aff') {
                    _this.manualFilter(data);
                }
                if (s.currentFilter === 'twitter') {
                    _this.twitterFilter(data);
                }
                if (s.currentFilter === 'ig') {
                    _this.instagramFilter(data);
                }
            } else {
                this.createTemplate(data);
            }
            //increment page num
            s.page++;
        })
        .catch(error => {
            console.log('error: ' + error);
        })
        .then(() => {
            window.setTimeout(function () {
                s.loading.style.display = 'none';
            }, 800);
        });
    }
};

export default PostModule;