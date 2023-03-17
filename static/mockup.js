var button1 = document.getElementById('addButton');
var buttonDecor = document.getElementById('two');
var addContainer = document.getElementById('one');
var viewContainer = document.getElementById('viewContainer');
var backButton = document.getElementById('backButton');
var launchButton = document.getElementById('launchButton');
var city = document.getElementById('cityContainer');
var meadow = document.getElementById('meadowContainer');
var ui = document.getElementById('uiContainer');
var viewAll = document.getElementById('selectButton1');
var selectDistrict = document.getElementById('selectDistrict');
var selectForm = document.getElementById('selectDistrictForm');
var fireStation = document.getElementById('selectButton3');
var goBack = document.getElementById('viewBack');
var optionDefault = document.getElementById('optionDefault');
var sectionLabel = document.getElementById('sectionLabel');
var addFormContainer = document.getElementById('addFormContainer');
var addDistrictButton = document.getElementById('addDistrictButton');
var filterContainer = document.getElementById('filterContainer');
var viewFilter = document.getElementById('viewFilter');
var addUpdate = document.getElementById('addUpdateContainer');
var homeBanner = document.getElementById('homeBanner');
var authors = document.getElementById('authors');

var updateLink = document.getElementById('updateLink');
var loadingSpinner = document.getElementById('loadingSpinner');

function activateViewButtons(){
    // goBack.addEventListener('click', viewResults);

    for(var button in filterContainer.children){
        if(button == 'length') break;

        else if(button == 0) continue;

        else if(button > 5){
            break;
        }
        else{
            filterContainer.children[button].addEventListener('click', selectTable);
        }
    }
}
function selectTable(){
    var selectedButton;
    for(var buttons in filterContainer.children){
        if(buttons == 'length') break;

        filterContainer.children[buttons].style.backgroundColor = 'white';
        filterContainer.children[buttons].style.border = 'solid #57728F 0px';
    }
    if(event.target.tagName == 'DIV'){
        selectedButton = event.target;
    }
    else{
        selectedButton = event.target.parentNode;
    }
    selectedButton.style.backgroundColor = "#dfe4e6";
    selectedButton.style.border = "solid #57728F 5px";

    loadingSpinner.style.zIndex = 1000;
    loadingSpinner.style.opacity = 1;
    loadingSpinner.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    console.log('/update' + selectedButton.id);
    window.location.href = '/update' + selectedButton.id;
}

meadow.addEventListener('click', ()=>{
    closeUi();
});

function closeUi(){
    ui.style.animationName = 'uiHide';
    city.style.animationName = 'city4';
    meadow.style.animationName = 'meadow2';
    launchButton.style.animationName = 'launchButton2';
    homeBanner.style.animationName = ('bannerIn');
    authors.style.animationName = ('authorsIn');
}



launchButton.addEventListener('click', ()=>{
    launchButton.style.animationName = 'launchButton';
    launchButton.style.animationIterationCount = 'unset';
    launchButton.style.animationFillMode = 'forwards';
    city.style.animationName = 'city';
    meadow.style.animationName = 'meadow';
    ui.style.animationName = 'ui';
    homeBanner.style.animationName = ('bannerOut');
    authors.style.animationName = ('authorsOut');
});


activateViewButtons();


