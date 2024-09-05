
let themesettings = `
<div class="sidebar-contact">
    <div class="toggle-theme"><i class="fa fa-cog fa-w-16 fa-spin"></i></div>
    </div>
    <div class="sidebar-themesettings">
    <div class="themesettings-header">
        <h4>Theme Customizer</h4>
        <a href="#" id="theme-settings"><i class="ti ti-x"></i></a>
    </div>
    <div class="themesettings-inner">
        <div class="themesettings-content">
            <h6>Layout</h6>
            <div class="row">
                <div class="col-lg-6">
                    <div class="input-themeselect">
                        <input type="radio" name="theme" id="lightTheme" value="light" checked>
                        <label for="lightTheme">
                            <img src="/assets/img/theme/theme-01.svg" alt="img">
                            <span class="w-100">
                                <span>Light</span>
                                <span class="checkboxs-theme"></span>
                            </span>
                        </label>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="input-themeselect">
                        <input type="radio" name="theme" id="darkTheme" value="dark" >
                        <label for="darkTheme">
                            <img src="/assets/img/theme/theme-02.svg" alt="img">
                            <span class="w-100">
                                <span>Dark</span>
                                <span class="checkboxs-theme"></span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <div class="themesettings-content">
            <h6>Colors</h6>
            <div class="row">
                <div class="col-lg-12">
                    <div class="theme-colorsset">
                        <ul>
                            <li>
                                <div class="input-themeselects">
                                    <input type="radio" name="color" id="redColor" value="red" checked>
                                    <label for="redColor" class="red-clr"></label>
                                </div>
                            </li>
                            <li>
                                <div class="input-themeselects">
                                    <input type="radio" name="color" id="yellowColor" value="yellow" >
                                    <label for="yellowColor" class="yellow-clr"></label>
                                </div>
                            </li>
                            <li>
                                <div class="input-themeselects">
                                    <input type="radio" name="color" id="blueColor" value="blue" >
                                    <label for="blueColor" class="blue-clr"></label>
                                </div>
                            </li>
                            <li>
                                <div class="input-themeselects">
                                    <input type="radio" name="color" id="greenColor" value="green">
                                    <label for="greenColor" class="green-clr"></label>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="themesettings-content">
            <h6>Sidebar</h6>
            <div class="row">
                <div class="col-lg-6">
                    <div class="input-themeselect">
                        <input type="radio" name="sidebar" id="lightSidebar" value="light" checked>
                        <label for="lightSidebar">
                            <img src="/assets/img/theme/theme-03.svg" alt="img">
                            <span class="w-100">
                                <span>Light</span>
                                <span class="checkboxs-theme"></span>
                            </span>
                        </label>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="input-themeselect">
                        <input type="radio" name="sidebar" id="darkSidebar" value="dark" >
                        <label for="darkSidebar">
                            <img src="/assets/img/theme/theme-04.svg" alt="img">
                            <span class="w-100">
                                <span>Dark</span>
                                <span class="checkboxs-theme"></span>
                            </span>
                        </label>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="input-themeselect">
                        <input type="radio" name="sidebar" id="blueSidebar" value="blue" >
                        <label for="blueSidebar">
                            <img src="/assets/img/theme/theme-05.svg" alt="img">
                            <span class="w-100">
                                <span>Blue</span>
                                <span class="checkboxs-theme"></span>
                            </span>
                        </label>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="input-themeselect">
                        <input type="radio" name="sidebar" id="greenSidebar" value="green" >
                        <label for="greenSidebar">
                            <img src="/assets/img/theme/theme-06.svg" alt="img">
                            <span class="w-100">
                                <span>Green</span>
                                <span class="checkboxs-theme"></span>
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="themesettings-footer">
        <ul>
            <li>
                <a href="#" class="btn btn-cancel close-theme">Cancel</a>
            </li>
            <li>
                <a href="#" id="resetbutton" class="btn btn-reset">Reset</a>
            </li>
        </ul>
    </div>
    </div>
            `

$("html").append(themesettings)
// Your JavaScript code here
setTimeout(function () {
    const applyScriptAfterDelay = () => {
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        const sidebarRadios = document.querySelectorAll('input[name="sidebar"]');
        const colorRadios = document.querySelectorAll('input[name="color"]');
        const sidebarBgRadios = document.querySelectorAll('input[name="sidebarbg"]');
        const resetbutton = document.getElementById('resetbutton');
        const sidebar = document.getElementById('sidebar');

        function setThemeAndSidebarTheme(theme, sidebarTheme, color, sidebarBg) {
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.setAttribute('data-sidebar', sidebarTheme);
            document.documentElement.setAttribute('data-color', color);
            localStorage.setItem('theme', theme);
            localStorage.setItem('sidebarTheme', sidebarTheme);
            localStorage.setItem('color', color);
            localStorage.setItem('sidebarBg', sidebarBg);
        }

        function handleInputChange(event) {
            const theme = document.querySelector('input[name="theme"]:checked') ? document.querySelector('input[name="theme"]:checked').value : 'light';
            const sidebarTheme = document.querySelector('input[name="sidebar"]:checked') ? document.querySelector('input[name="sidebar"]:checked').value : 'light';
            const color = document.querySelector('input[name="color"]:checked') ? document.querySelector('input[name="color"]:checked').value : 'yellow';
            const sidebarBg = document.querySelector('input[name="sidebarbg"]:checked') ? document.querySelector('input[name="sidebarbg"]:checked').value : 'sidebarbg1';
            setThemeAndSidebarTheme(theme, sidebarTheme, color, sidebarBg);
        }

        function resetThemeAndSidebarThemeAndColorAndBg() {
            setThemeAndSidebarTheme('light', 'light', 'yellow', 'sidebarbg1');

            const lightThemeRadio = document.getElementById('lightTheme');
            const lightSidebarRadio = document.getElementById('lightSidebar');
            const yellowColorRadio = document.getElementById('yellowColor');

            if (lightThemeRadio) {
                lightThemeRadio.checked = true;
            }

            if (lightSidebarRadio) {
                lightSidebarRadio.checked = true;
            }

            if (yellowColorRadio) {
                yellowColorRadio.checked = true;
            }
        }

        themeRadios.forEach(radio => radio.addEventListener('change', handleInputChange));
        sidebarRadios.forEach(radio => radio.addEventListener('change', handleInputChange));
        colorRadios.forEach(radio => radio.addEventListener('change', handleInputChange));
        resetbutton.addEventListener('click', resetThemeAndSidebarThemeAndColorAndBg);

        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedSidebarTheme = localStorage.getItem('sidebarTheme') || 'light';
        const savedColor = localStorage.getItem('color') || 'yellow';

        setThemeAndSidebarTheme(savedTheme, savedSidebarTheme, savedColor);
        document.getElementById(`${savedTheme}Theme`).checked = true;
        document.getElementById(`${savedColor}Color`).checked = true;
    };

    applyScriptAfterDelay();
}); // 2000 milliseconds = 2 seconds