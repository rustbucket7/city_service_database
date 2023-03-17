//define form DOM elements
var dAddForm = document.getElementById('dAddForm');
var dEditForm = document.getElementById('dEditForm');
var dDeleteForm = document.getElementById('dDeleteForm');
var sAddForm = document.getElementById('sAddForm');
var sDeleteForm = document.getElementById('sDeleteForm');
var selectForm = document.getElementById('selectForm');
var cancelButtons = document.getElementsByClassName('cancelButtons');
var loadingSpinner = document.getElementById('loadingSpinner');
var pageForms = document.getElementsByClassName('pageForms');
var filterButton = document.getElementById('filterButton');

// assumes tbody of districtTable has an id for easy access... consider adding one to it called 'dTableBody'
// assumes tbody of schoolTable has an id for easy access... consider adding one to it called 'sTableBody'
// and so on...
var dTableBody = document.getElementById('dTableBody');  // updateDistrict page
var sTableBody = document.getElementById('sTableBody');  // updateDistrict page
var sDTableBody = document.getElementById('sDTableBody');  // updateSchool page
var fTableBody = document.getElementById('fTableBody');  // updateFire page
var pTableBody = document.getElementById('pTableBody');  // updatePolice page
var sSTableBody = document.getElementById('sSTableBody');  // updateSocial page

window.addEventListener('load', pageLoadTables);

function pageLoadTables (){
    var tableType = document.URL;
    console.log('Loading page tables using URL: ', tableType);
    if(tableType.includes('District')) populateDistrictPageTable();
    else if(tableType.includes('Police')) populatePoliceTable();
    else if(tableType.includes('Fire')) populateFireTable();
    else if(tableType.includes('School')) populateSchoolPageTable();
    else populateSocialTable();
}

function displayForm(){
    console.log('form change', event.target.value);
    var selectedForm = event.target.value;
    try{
        dAddForm.style.display = 'none';
        dEditForm.style.display = 'none';
        dDeleteForm.style.display = 'none';
        sAddForm.style.display = 'none';
        sDeleteForm.style.display = 'none';
    }
    catch{
        addForm.style.display = 'none';
        editForm.style.display = 'none';
        deleteForm.style.display = 'none';
    }

    if(selectedForm == 'add'){
        try{
            clearForm(dEditForm);
            clearForm(dDeleteForm);
            clearForm(sDeleteForm);
            dAddForm.style.display = 'block';
            sAddForm.style.display = 'block';
        }
        catch{
            clearForm(editForm);
            clearForm(deleteForm);
            addForm.style.display = 'block';
        }
       
    }
    else if(selectedForm == 'edit'){
        try{
            clearForm(dAddForm);
            clearForm(dDeleteForm);
            clearForm(sAddForm);
            clearForm(sDeleteForm);
            dEditForm.style.display = 'block';
        }
        catch{
            clearForm(addForm);
            clearForm(deleteForm);
            editForm.style.display = 'block';
        }
    }
    else if(selectedForm == 'delete'){
        try{
            
        clearForm(dAddForm);
        clearForm(dEditForm);
        clearForm(sAddForm);
        dDeleteForm.style.display = 'block';
        sDeleteForm.style.display = 'block';
        }
        catch{
            clearForm(addForm);
            clearForm(editForm);
            deleteForm.style.display = 'block';
        }
    }
    else{
        return;
    }
}

function cancelForm(){
    addForm.style.display = 'none';
    editForm.style.display = 'none';
    deleteForm.style.display = 'none';
    selectForm.value = 'default';
    clearForm(addForm);
    clearForm(editForm);
    clearForm(deleteForm);
}

function submitForm(){
    console.log('submitting form');
    event.preventDefault();
    loadingSpinner.style.zIndex = 5000;
    loadingSpinner.style.opacity = 1;
    loadingSpinner.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';

    //construct AJAX data packet
    var sendPacket = {'table': '', 'data': {}};

    //determine the district page and update table key in AJAX data;
    var tableType = document.URL;
    if(tableType.includes('District')){
        //determine district table or M:M table
        if(event.target.id[0] == 's'){
            sendPacket.table = 'SchoolsToCityDistricts';
        }
        else{
            sendPacket.table = 'CityDistricts';
        }
    }
    else if(tableType.includes('Police')) sendPacket.table = 'PoliceStations';
    else if(tableType.includes('Fire')) sendPacket.table = 'FireStations';
    else if(tableType.includes('School')) sendPacket.table = 'Schools';
    else sendPacket.table = 'SocialServices';

    //determine the type of form
    var queryType = selectForm.value;

    //add the input values to the data object
    sendPacket.data = gatherFormData(event.target);

    console.log(sendPacket);

    //open AJAX request
    var request = new XMLHttpRequest();
    request.open('POST', queryType + 'Rows', true);
    //Add load event listener to reference a page update function
    request.addEventListener('load', ()=>{
        // logic to choose correct populate...() function
        if (sendPacket.table == 'SchoolsToCityDistricts' || sendPacket.table == 'CityDistricts') {
		console.log("grabbing rows for CityDistricts and SchoolsToCityDistricts")
		populateDistrictPageTable();
	} else if (sendPacket.table == 'Schools') {
		console.log("grabbing rows for Schools");
		populateSchoolPageTable();
	} else if (sendPacket.table == 'FireStations') {
		console.log("grabbing rows for FireStations");
		populateFireTable();
	} else if (sendPacket.table == 'PoliceStations') {
		console.log("grabbing rows for PoliceStations");
		populatePoliceTable();
	} else if (sendPacket.table == 'SocialServices') {
		console.log("grabbing rows for SocialServices");
		populateSocialTable();
	}
        
        loadingSpinner.style.zIndex = -1;
        loadingSpinner.style.opacity = 0;
        return;
    });

    //console.log("Sending AJAX to: ", 'http:localhost:5000/' + queryType + 'Rows')
    //Send AJAX request
    request.setRequestHeader('Content-type', 'application/json')
    request.send(JSON.stringify(sendPacket));

}

function gatherFormData(form){
    //initialize object
    var dataObject = {};
    //console.log(form);
    //mostly we'll just go through each input and pull the value until we reach the submit button, however for the district adds and updates,
    //we'll have to iterate through the schools and socials selected and build an object of them to submit.

    //determine if form being submitted is a district add or district edit which will have select inputs
    if((form.id.includes('Add') || form.id.includes('Edit')) && document.URL.includes('District')) {
        //get values from the district add/edit form
        var inputs = form.children;
        for(var node in inputs){
            var nameStr = inputs[node].name;
            if(inputs[node].type == 'submit') break;
            else if(inputs[node].tagName == "BR") continue;
            else if (inputs[node].tagName == 'SELECT' && inputs[node].name == 'fStationId'){
                //get single selected value
                var fireOptions = document.getElementsByClassName('fireOptions');
                for(var fire in fireOptions){
                    if(fireOptions[fire].value == inputs[node].value){
                        dataObject[nameStr] = fireOptions[fire].value;
                    }
                }
            }
            else if (inputs[node].tagName == 'SELECT' && inputs[node].name == 'pStationId'){
                //get single selected value
                var policeOptions = document.getElementsByClassName('policeOptions');
                for(var police in policeOptions){
                    if(policeOptions[police].value == inputs[node].value){
                        dataObject[nameStr] = policeOptions[police].value;
                    }
                }
            }
            else if (inputs[node].tagName == 'SELECT' && inputs[node].name == 'sServiceId'){
                //get single selected value
                var socialOptions = document.getElementsByClassName('socialOptions');
                for(var social in socialOptions){
                    if(socialOptions[social].value == inputs[node].value){
                        dataObject[nameStr] = socialOptions[social].value;
                    }
                }
            }
            else if (inputs[node].tagName == 'SELECT' && inputs[node].name == 'sId'){
                console.log('SCHOOL SELECTED IS: ', inputs[node].value);
                dataObject[nameStr] = inputs[node].value;
            }
            // else if (inputs[node].tagName == 'UL'){
            //     //get list of schools
            //     var schoolList = [];
            //     console.log('School List = ', inputs[node].children);
            //     for(var item in inputs[node].children){
            //         if(item == 'length') break;
            //         else{
            //             var innerTxt = String(inputs[node].children[item].innerText);
            //             innerTxt = innerTxt.slice(0, -2);
            //             console.log('TEXT', innerTxt);
            //             schoolList.push(innerTxt);
            //         }
            //     }
            //     dataObject.sId = schoolList;
            // }
            else{
                //regular input
                dataObject[nameStr] = inputs[node].value;
            }
        }
    }
    
    else{
        //get the input values until we reach the submit button
        var inputs = form.children;
        for (var node in inputs){
            if(inputs[node].type == 'submit') break;
            else if(inputs[node].tagName == "BR") continue;
            else{
                var nameStr = inputs[node].name;
                dataObject[nameStr] = inputs[node].value;
            }
        }
    }
    //console.log("Data Packet = ", dataObject);
    return dataObject;
}


// var selectedSchools = [];
// var schoolSelect = document.getElementById('schoolSelect');
// function addSchool(){
//     //if school value is already selected, return
//     if(selectedSchools.includes(schoolSelect.value)) return;
//     //build li item 
//     else{
//         var selectedItem = document.getElementById(schoolSelect.value);
//         var newLi= document.createElement('li');
//         //insert value from schoolSelect
//         newLi.innerText = selectedItem.innerText;
//         //add value to list of selected schools
//         selectedSchools.push(schoolSelect.value);

//         //create X element on Li that is linked to removeSchool
//         var xItem = document.createElement('div');
//         xItem.innerText = "X";
//         xItem.classList = "schoolDelete";
//         xItem.addEventListener('click', removeSchool);
//         newLi.append(xItem);

//         //append li to the ul of schools
//         document.getElementById('selectedSchools').append(newLi);
//     }
// }

// var schoolEdit = document.getElementById('schoolEdit');
// function editSchool(){
//     //if school value is already selected, return
//     if(selectedSchools.includes(schoolEdit.value)) return;
//     //build li item 
//     else{
//         var selectedItem = document.getElementById(schoolEdit.value);
//         var newLi= document.createElement('li');
//         //insert value from schoolSelect
//         newLi.innerText = selectedItem.innerText;
//         //add value to list of selected schools
//         selectedSchools.push(schoolEdit.value);

//         //create X element on Li that is linked to removeSchool
//         var xItem = document.createElement('div');
//         xItem.innerText = "X";
//         xItem.classList = "schoolDelete";
//         xItem.addEventListener('click', removeSchool);
//         newLi.append(xItem);

//         //append li to the ul of schools
//         document.getElementById('editedSchools').append(newLi);
//     }
// }

// function removeSchool(){
//     //get the li object
//     var deleteLi = event.target.parentNode;
//     //remove the li value from the list of selected schools
//         selectedSchools.splice(selectedSchools.indexOf(deleteLi.id), 1);
//     //remove the li node.
//     var ulList = deleteLi.parentNode;
//     deleteLi.remove(ulList); 
// }

function clearForm(form){
    //implement and tie to cancelForm function
    //empty selected schools list
    selectedSchools = [];

    //iterate through forms and set values to default
    for(var item in form.children){
        if(form.children[item].tagName == 'BR') continue;
        else if(form.children[item].type == 'submit') break;
        else if (form.children[item].tagName == 'SELECT'){
            form.children[item].value = 'default';
        }
        else if(form.children[item].tagName == "UL"){
            form.children[item].innerHTML = '';
        }
        else{
            form.children[item].value = '';
        }
    }

}

for(var button in cancelButtons){
    if(button == 'length') break;
    cancelButtons[button].addEventListener('click', cancelForm);
}

for(var submit in pageForms){
    if(submit == 'length') break;
    pageForms[submit].addEventListener('submit', submitForm);
}

try{
    filterButton.addEventListener('click', applyFilter);
}
catch{
    console.log('No Filter Capability on this page');
}

function applyFilter(){
    event.preventDefault();
    //a function to send a filter request to the backend to return a filtered table. Gets the min max values and updates the table accordingly.
    var filterForm = document.getElementById('filterForm');
    var filterMin = document.getElementById('filterMin');
    var filterMax = document.getElementById('filterMax');
    console.log('applying the filter')

    var minimum = filterMin.value;
    var maximum = filterMax.value;

    if(minimum == ''){
        alert("Please enter a Minimum Budget Value"); 
        return;
    }
    else if(maximum == ''){
        alert("Please enter a Maximum Budget Value");
    }
    else{
        populateDistrictPageTable(1, minimum, maximum)
    }
}


function clearTable(tbody_parent) {
	// while there exists a child of tbody_parent, remove it
	while (tbody_parent.lastElementChild) {
		tbody_parent.removeChild(tbody_parent.lastChild);
	}  // close of while-loop that removes all children of tbody_parent

}  // close of clearTable() function

function populateDistrictPageTable(search=0, min=0, max=0) {
	// delete all current table rows in dTableBody and sTableBody ??????
	clearTable(dTableBody);
	clearTable(sTableBody);


	// get the all current DB rows in CityDistricts table via AJAX call
	// JSON to be sent to server's /getRows() route -- {'table': 'CityDistricts', 'isSearch': False, 'min': 0, 'max': 0}
	// this will trigger the backend to perform the query "SELECT * from CityDistricts;"

	var json_to_DB_district = {'table': 'CityDistricts', 'isSearch': search, 'min': min, 'max': max};
	var data_district;

	var request_district = new XMLHttpRequest();
	request_district.open('POST', 'getRows', true);
	request_district.addEventListener('load', ()=>{
		// within the AJAX call, grab the 'data' containing the DB rows
		data_district = JSON.parse(request_district.response)['data'];
		console.log("Returned object:", request_district.response);

		// iterate through data_district to get all of the DB rows
		// create new data rows for table from these DB rows
		for (var drow in data_district) {
			drow = data_district[drow];  // set drow to be the current DB row's values
			
			// build tr and append to dTableBody
			var dTableRow = document.createElement('tr');
			dTableBody.append(dTableRow);

			// build td and append to dTableRow for each 'key' in data_district
			// you will need create each td manually as Python likes to order its dicts{}... yes it is a pain
			var dTD_id = document.createElement('td');
			var dTD_dname = document.createElement('td');
			var dTD_fid = document.createElement('td');
			var dTD_pid = document.createElement('td');
			var dTD_ssid = document.createElement('td');
			var dTD_budget = document.createElement('td');

			// set the td's innerText value and append to dTableRow
			dTD_id.innerText = drow['cityDistrictId'];
			dTableRow.append(dTD_id);
			dTD_dname.innerText = drow['dName'];
			dTableRow.append(dTD_dname);
			dTD_fid.innerText = drow['fStationId'];
			dTableRow.append(dTD_fid);
			dTD_pid.innerText = drow['pStationId'];
			dTableRow.append(dTD_pid);
			dTD_ssid.innerText = drow['sServiceId'];
			dTableRow.append(dTD_ssid);
			dTD_budget.innerText = drow['districtBudget'];
			dTableRow.append(dTD_budget);

		};  // close for-loop that fills the districtTable

	});  // close addEventListener for getting CityDistrict rows
	request_district.setRequestHeader('Content-type', 'application/json');
	request_district.send(JSON.stringify(json_to_DB_district));

	// put some time delay between the previous AJAX call and this one... flask doesn't seem to like async calls
        setTimeout(function() {
		var json_to_DB_school = {'groupUp': 'Schools'};
        	var data_group_schools;

        	var request_schools = new XMLHttpRequest();
        	request_schools.open('POST', 'getRowsAgg', true);
        	request_schools.addEventListener('load', ()=>{
			data_group_schools = JSON.parse(request_schools.response)['data'];
                	console.log("Returned object:", data_group_schools);

			for (var srow in data_group_schools) {
				srow = data_group_schools[srow];
				
				var sTableRow = document.createElement('tr');
                        	sTableBody.append(sTableRow);

				var sTD_dname = document.createElement('td');
                       		var sTD_sname = document.createElement('td');

				sTD_dname.innerText = srow['dName'];
                        	sTableRow.append(sTD_dname);
                        	sTD_sname.innerText = srow['sName'];
                        	sTableRow.append(sTD_sname);

			};

		});
		request_schools.setRequestHeader('Content-type', 'application/json');
        	request_schools.send(JSON.stringify(json_to_DB_school));

        }, 1000);  // wait 1 second

};  // close populateDistrictPageTables() function


function populateSchoolPageTable() {
	// clear sDTableBody
	clearTable(sDTableBody);

	// get the all current DB rows in Schools table via AJAX call
	var json_to_DB_schoolDistricts = {'table': 'Schools', 'isSearch': 0, 'min': 0, 'max': 0};
	var data_schoolDistricts;
	
	var request_schoolDistricts = new XMLHttpRequest();
	request_schoolDistricts.open('POST', 'getRows', true);
	request_schoolDistricts.addEventListener('load', ()=>{
		// within the AJAX call, grab the 'data' containing the DB rows
		data_schoolDistricts = JSON.parse(request_schoolDistricts.response)['data'];
		console.log("Returned object:", request_schoolDistricts.response);

		// iterate through data_district to get all of the DB rows
		// create new data rows for table from these DB rows
		for (var sdrow in data_schoolDistricts) {
			sdrow = data_schoolDistricts[sdrow];
			
			// build tr and append to sDTableBody
			var sDTableRow = document.createElement('tr');
			sDTableBody.append(sDTableRow);

			// build td and append to dTableRow for each 'key' in data_schoolDistricts
			// you will need create each td manually as Python likes to order its dicts{}... yes it is a pain
			var sDTD_id = document.createElement('td');
			var sDTD_sname = document.createElement('td');
			var sDTD_scost = document.createElement('td');

			// set the td's innerText value and append to sDTableRow
			sDTD_id.innerText = sdrow['schoolId'];
			sDTableRow.append(sDTD_id);
			sDTD_sname.innerText = sdrow['sName'];
			sDTableRow.append(sDTD_sname);
			sDTD_scost.innerText = sdrow['sCost'];
			sDTableRow.append(sDTD_scost);
		};  // close for-loop that fills the schoolDistrictsTable

	});  // close addEventListener for getting Schools rows
	request_schoolDistricts.setRequestHeader('Content-type', 'application/json');
	request_schoolDistricts.send(JSON.stringify(json_to_DB_schoolDistricts));

};  // close populateSchoolPageTables() function


function populateFireTable() {
	// clear table
	clearTable(fTableBody);
	
	// init var for json to DB backend and capture response 'data'
	var json_to_DB_fire = {'table': 'FireStations', 'isSearch': 0, 'min': 0, 'max': 0};
	var data_fire;
	
	// open AJAX call to backend
	var request_fire = new XMLHttpRequest();
	request_fire.open('POST', 'getRows', true);
	request_fire.addEventListener('load', ()=>{
		// within the AJAX call, grab the 'data' containing the DB rows
		data_fire = JSON.parse(request_fire.response)['data'];
		console.log("Returned object:", request_fire.response);
		
		// iterate through 'data' to get all of the DB rows
		for (var frow in data_fire) {
			frow = data_fire[frow];
			
			// build tr and append to fTableBody
			var fTableRow = document.createElement('tr');
			fTableBody.append(fTableRow);
			
			var fTD_id = document.createElement('td');
			var fTD_fname = document.createElement('td');
			var fTD_fcost = document.createElement('td');
			
			fTD_id.innerText = frow['fireStationId'];
			fTableRow.append(fTD_id);
			fTD_fname.innerText = frow['fName'];
			fTableRow.append(fTD_fname);
			fTD_fcost.innerText = frow['fCost'];
			fTableRow.append(fTD_fcost);
		};
	});
	request_fire.setRequestHeader('Content-type', 'application/json');
	request_fire.send(JSON.stringify(json_to_DB_fire));
};


function populatePoliceTable() {
	// clear table
	clearTable(pTableBody);
	
	// init var for json to DB backend and capture response 'data'
	var json_to_DB_police = {'table': 'PoliceStations', 'isSearch': 0, 'min': 0, 'max': 0};
	var data_police;
	
	// open AJAX call to backend
	var request_police = new XMLHttpRequest();
	request_police.open('POST', 'getRows', true);
	request_police.addEventListener('load', ()=>{
		// within the AJAX call, grab the 'data' containing the DB rows
		data_police = JSON.parse(request_police.response)['data'];
		console.log("Returned object:", request_police.response);
		
		// iterate through 'data' to get all of the DB rows
		for (var prow in data_police) {
			prow = data_police[prow];
			
			// build tr and append to fTableBody
			var pTableRow = document.createElement('tr');
			pTableBody.append(pTableRow);
			
			var pTD_id = document.createElement('td');
			var pTD_pname = document.createElement('td');
			var pTD_pcost = document.createElement('td');
			
			pTD_id.innerText = prow['policeStationId'];
			pTableRow.append(pTD_id);
			pTD_pname.innerText = prow['pName'];
			pTableRow.append(pTD_pname);
			pTD_pcost.innerText = prow['pCost'];
			pTableRow.append(pTD_pcost);
		};
	});
	request_police.setRequestHeader('Content-type', 'application/json');
	request_police.send(JSON.stringify(json_to_DB_police));
};


function populateSocialTable() {
	// clear table
	clearTable(sSTableBody);
	
	// init var for json to DB backend and capture response 'data'
	var json_to_DB_social = {'table': 'SocialServices', 'isSearch': 0, 'min': 0, 'max': 0};
	var data_social;
	
	// open AJAX call to backend
	var request_social = new XMLHttpRequest();
	request_social.open('POST', 'getRows', true);
	request_social.addEventListener('load', ()=>{
		// within the AJAX call, grab the 'data' containing the DB rows
		data_social = JSON.parse(request_social.response)['data'];
		console.log("Returned object:", request_social.response);
		
		// iterate through 'data' to get all of the DB rows
		for (var ssrow in data_social) {
			ssrow = data_social[ssrow]
			
			// build tr and append to fTableBody
			var sSTableRow = document.createElement('tr');
			sSTableBody.append(sSTableRow);
			
			var sSTD_id = document.createElement('td');
			var sSTD_ssname = document.createElement('td');
			var sSTD_sscost = document.createElement('td');
			
			sSTD_id.innerText = ssrow['socialServiceId'];
			sSTableRow.append(sSTD_id);
			sSTD_ssname.innerText = ssrow['serviceType'];
			sSTableRow.append(sSTD_ssname);
			sSTD_sscost.innerText = ssrow['sSCost'];
			sSTableRow.append(sSTD_sscost);
		};
	});
	request_social.setRequestHeader('Content-type', 'application/json');
	request_social.send(JSON.stringify(json_to_DB_social));
};
