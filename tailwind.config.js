module.exports = {
  content: [
    './*.html',
    './blog/*.html',
    './en/*.html',
    './en/blog/*.html',
    './assets/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'svb-green-light': '#98D0B3',
        'svb-green-dark': '#4A8D84',
        'svb-sand': '#F2E6CF',
        'svb-peach': '#E8B496',
        'svb-text': '#2F4F4F',
      },
      fontFamily: {
        'sans': ['Montserrat', 'sans-serif'],
        'hand': ['Dancing Script', 'cursive'],
        'vibes': ['Great Vibes', 'cursive'],
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
};
