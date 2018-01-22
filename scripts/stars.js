window.onload = function () {
    var elemStr = `<a class="github-button" href="https://github.com/ashubham/custody" data-icon="octicon-star" data-show-count="true" aria-label="Star ashubham/custody on GitHub">Star</a>`;
    var target = document.getElementsByClassName('right')[0];
    target.insertAdjacentHTML('afterbegin', elemStr);
    var script = document.createElement('script');
    script.src = "https://buttons.github.io/buttons.js";
    document.head.appendChild(script);
}