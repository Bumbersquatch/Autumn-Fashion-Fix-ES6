import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import Layzr from 'layzr.js';
import moment from 'moment';

imagesLoaded.makeJQueryPlugin($);

const PostModule = {
    s: {
        numArticles: 20,
        page: 1,
        postList: document.getElementById('post-list'),
        postItem: $('#post'),
        moreButton: $('#loadMoreButton'),
        loading: $('.loading'),
        affFilterBtn: $('#aff-btn'),
        twitterFilterBtn: $('#twitter-btn'),
        igFilterBtn: $('#ig-btn'),
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
            s.masonryContainer.imagesLoaded(() => {
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
            s.layzr.update().check();
            $('.btn-secondary').removeAttr('disabled');
            this.s.moreButton.removeAttr('disabled');
        });

        this.s.masonryContainer = $(s.postList);
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
        this.s.moreButton.on('click', function (e) {
            e.preventDefault();
            _this.getMorePosts();
        });
        this.s.affFilterBtn.on('click', function (e) {
            e.preventDefault();
            _this.filterPosts('aff', $(this));
        });
        this.s.twitterFilterBtn.on('click', function (e) {
            e.preventDefault();
            _this.filterPosts('twitter', $(this));
        });
        this.s.igFilterBtn.on('click', function (e) {
            e.preventDefault();
            _this.filterPosts('ig', $(this));
        });
    },

    filterPosts(type, btn) {
        const msnry = this.s.msnry;
        const $container = this.s.masonryContainer;
        const currentData = this.s.currentData;
        $container.html('');
        $('.btn-secondary').attr('disabled', 'disabled');
        if (btn.hasClass('active')) {
            btn.removeClass('active');
            this.s.currentFilter = null;
            this.createTemplate(currentData);
            msnry.reloadItems();
            msnry.layout();
        } else {
            this.s.currentFilter = type;
            $('.filter-row .btn').removeClass('active');
            btn.addClass('active');
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
        const source = this.s.postItem.html();
        const template = Handlebars.compile(source);
        let html = template(data);
        this.s.masonryContainer.append(html);
        msnry.reloadItems();
        msnry.layout();
        this.s.layzr.update().check();
    },

    getMorePosts() {
        const s = this.s,
            num = this.s.numArticles,
            page = this.s.page;
        const _this = this;
        this.s.loading.show();
        this.s.moreButton.attr('disabled', 'disabled');
        $.ajax({
            url: 'https://private-cc77e-aff.apiary-mock.com/posts',
            data: {
                page: page,
                numPosts: num
            },
            success: (data) => {
                //sorting json data, should be sorted from api 
                data['items'].sort(function (a, b) {
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
            },
            error: (data) => {
                console.log('error: ' + data);
            }
        }).then(() => {
            window.setTimeout(function () {
                s.loading.fadeOut();
            }, 800);
        })
    }
};

export default PostModule;