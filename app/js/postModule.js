import jQueryBridget from 'jquery-bridget';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import Layzr from 'layzr.js';


// make Masonry a jQuery plugin
//jQueryBridget('masonry', Masonry, $);
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
        currentHtml: []
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
            normal: 'data-normal',
            threshold: 0
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

        msnry.on('removeComplete', () => {
            msnry.reloadItems();
            msnry.layout();
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
            const date = new Date(date_raw);
            const fd = date.toDateString();
            return fd;
        });
    },

    bindUIActions() {
        const _this = this;
        this.s.moreButton.on('click', function () {
            _this.getMorePosts();
        });
        this.s.affFilterBtn.on('click', function () {
            _this.filterPosts('aff', $(this));
        });
        this.s.twitterFilterBtn.on('click', function () {
            _this.filterPosts('twitter', $(this));
        });
        this.s.igFilterBtn.on('click', function () {
            _this.filterPosts('ig', $(this));
        });
    },

    filterPosts(type, btn) {
        const msnry = this.s.msnry;
        const $container = this.s.masonryContainer;
        //reset to show all posts before filtering
        $container.html(this.s.currentHtml);
        msnry.reloadItems();
        $('.btn-secondary').attr('disabled', 'disabled');
        if (btn.hasClass('active')) {
            btn.removeClass('active');
            this.s.currentFilter = null;
            msnry.layout();
        } else {
            this.s.currentFilter = type;
            $('.filter-row .btn').removeClass('active');
            btn.addClass('active');
            if (type === 'aff') {
                msnry.remove($('.grid-item').not('.manual-post'));
            }
            if (type === 'ig') {
                msnry.remove($('.grid-item').not('.instagram-post'));
            }
            if (type === 'twitter') {
                msnry.remove($('.grid-item').not('.twitter-post'));
            }
        }
    },

    getMorePosts() {
        const s = this.s,
            num = this.s.numArticles,
            page = this.s.page;
        this.s.loading.show();
        this.s.moreButton.attr('disabled', 'disabled');
        $.ajax({
            url: 'http://private-cc77e-aff.apiary-mock.com/posts',
            data: {
                page: page,
                numPosts: num
            },
            success: (data) => {
                const msnry = s.msnry;
                const $container = s.masonryContainer;

                //sorting json data, should be sorted from api 
                data['items'].sort(function (a, b) {
                    const dateA = new Date(a.item_published),
                        dateB = new Date(b.item_published);
                    return dateB - dateA;
                });

                const source = s.postItem.html();
                const template = Handlebars.compile(source);
                let html = template(data);
                html = $(html).hide();
                $container.append(html);
                this.s.currentHtml.push(html);

                $container.imagesLoaded(function () {
                    $(html).fadeIn();
                    if (s.currentFilter !== null) {
                        if (s.currentFilter === 'aff') {
                            msnry.reloadItems();
                            const $msnryItems = $('.grid-item').not('.manual-post');
                            msnry.remove($msnryItems);
                        }
                        if (s.currentFilter === 'twitter') {
                            msnry.reloadItems();
                            const $msnryItems = $('.grid-item').not('.twitter-post');
                            msnry.remove($msnryItems);
                        }
                        if (s.currentFilter === 'ig') {
                            msnry.reloadItems();
                            const $msnryItems = $('.grid-item').not('.instagram-post');
                            msnry.remove($msnryItems);
                        }
                    } else {
                        msnry.reloadItems();
                        msnry.layout();
                    }
                    s.page++;
                });
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