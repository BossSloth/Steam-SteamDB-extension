export function getNeededScripts(): string[] {
    let href = window.location.href;
    let scripts = [];

    //#region Autogenerated code from convert-manifest.py
    if (href.match("https://store\.steampowered\.com/app/.*")) {
        scripts.push("scripts/store/app_error.js");
        scripts.push("scripts/store/app.js");
        scripts.push("scripts/store/app_images.js");
    }
    
    if (href.match("https://store\.steampowered\.com/news/app/.*")) {
        scripts.push("scripts/store/app_error.js");
        scripts.push("scripts/store/app_news.js");
    }
    
    if (href.match("https://store\.steampowered\.com/account/licenses.*")) {
        scripts.push("scripts/store/account_licenses.js");
        scripts.push("styles/account_licenses.css");
    }
    
    if (href.match("https://store\.steampowered\.com/account/registerkey.*")) {
        scripts.push("scripts/store/registerkey.js");
    }
    
    if (href.match("https://store\.steampowered\.com/sub/.*")) {
        scripts.push("scripts/store/sub.js");
    }
    
    if (href.match("https://store\.steampowered\.com/bundle/.*")) {
        scripts.push("scripts/store/bundle.js");
    }
    
    if (href.match("https://store\.steampowered\.com/widget/.*")) {
        scripts.push("scripts/store/widget.js");
    }
    
    if (href.match("https://store\.steampowered\.com/app/.*/agecheck") || href.match("https://store\.steampowered\.com/agecheck/.*")) {
        scripts.push("scripts/store/app_error.js");
        scripts.push("scripts/store/agecheck.js");
    }
    
    if (href.match("https://store\.steampowered\.com/explore.*")) {
        scripts.push("scripts/store/explore.js");
    }
    
    if (href.match("https://store\.steampowered\.com/app/.*") || href.match("https://steamcommunity\.com/app/.*") || href.match("https://steamcommunity\.com/sharedfiles/filedetails.*") || href.match("https://steamcommunity\.com/workshop/filedetails.*") || href.match("https://steamcommunity\.com/workshop/browse.*") || href.match("https://steamcommunity\.com/workshop/discussions.*")) {
        scripts.push("scripts/appicon.js");
    }
    
    if (href.match("https://steamcommunity\.com/id/.*") || href.match("https://steamcommunity\.com/profiles/.*")) {
        scripts.push("scripts/community/profile.js");
    }
    
    if (href.match("https://steamcommunity\.com/id/.*/inventory.*") || href.match("https://steamcommunity\.com/profiles/.*/inventory.*")) {
        scripts.push("scripts/community/profile_inventory.js");
        scripts.push("styles/inventory.css");
    }
    
    if (href.match("https://steamcommunity\.com/id/.*/stats.*") || href.match("https://steamcommunity\.com/profiles/.*/stats.*")) {
        scripts.push("scripts/community/achievements.js");
        scripts.push("scripts/community/achievements_profile.js");
        scripts.push("styles/achievements.css");
    }
    
    if (href.match("https://steamcommunity\.com/id/.*/stats/CSGO.*") || href.match("https://steamcommunity\.com/profiles/.*/stats/CSGO.*")) {
        scripts.push("scripts/community/achievements_cs2.js");
        scripts.push("styles/achievements_cs2.css");
    }
    
    if (href.match("https://steamcommunity\.com/stats/.*/achievements.*")) {
        scripts.push("scripts/community/achievements.js");
        scripts.push("scripts/community/achievements_global.js");
        scripts.push("styles/achievements.css");
    }
    
    if (href.match("https://steamcommunity\.com/tradeoffer/.*")) {
        scripts.push("scripts/community/tradeoffer.js");
    }
    
    if (href.match("https://steamcommunity\.com/id/.*/recommended/.*") || href.match("https://steamcommunity\.com/profiles/.*/recommended/.*")) {
        scripts.push("scripts/community/profile_recommended.js");
    }
    
    if (href.match("https://steamcommunity\.com/id/.*/badges.*") || href.match("https://steamcommunity\.com/profiles/.*/badges.*")) {
        scripts.push("scripts/community/profile_badges.js");
    }
    
    if (href.match("https://steamcommunity\.com/id/.*/gamecards/.*") || href.match("https://steamcommunity\.com/profiles/.*/gamecards/.*")) {
        scripts.push("scripts/community/profile_gamecards.js");
    }
    
    if (href.match("https://steamcommunity\.com/app/.*") || href.match("https://steamcommunity\.com/sharedfiles/filedetails.*") || href.match("https://steamcommunity\.com/workshop/filedetails.*") || href.match("https://steamcommunity\.com/workshop/browse.*") || href.match("https://steamcommunity\.com/workshop/discussions.*")) {
        scripts.push("scripts/community/gamehub.js");
    }
    
    if (href.match("https://steamcommunity\.com/sharedfiles/filedetails.*") || href.match("https://steamcommunity\.com/workshop/filedetails.*")) {
        scripts.push("scripts/community/filedetails.js");
        scripts.push("scripts/community/filedetails_guide.js");
    }
    
    if (href.match("https://steamcommunity\.com/market/multibuy.*")) {
        scripts.push("scripts/community/multibuy.js");
    }
    
    if (href.match("https://steamcommunity\.com/market/.*")) {
        scripts.push("scripts/community/market.js");
        scripts.push("styles/market.css");
    }
    
    if (href.match("https://steamcommunity\.com/app/.*") || href.match("https://steamcommunity\.com/games/.*") || href.match("https://steamcommunity\.com/sharedfiles/.*") || href.match("https://steamcommunity\.com/workshop/.*")) {
        scripts.push("scripts/community/agecheck.js");
    }
    
    if (href.match("https://steamcommunity\.com/market/.*") || href.match("https://steamcommunity\.com/id/.*/inventory.*") || href.match("https://steamcommunity\.com/profiles/.*/inventory.*")) {
        scripts.push("scripts/community/market_ssa.js");
    }
    //#endregion

    return scripts;
}