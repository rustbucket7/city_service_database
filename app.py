from flask import Flask, render_template, json, request
import os
import database.db_connector as db

app = Flask(__name__)
db_connection = db.connect_to_database()

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/updateDistrict')
def updateDistrict():
    # get list of fire stations
    getQuery = "SELECT `fireStationId` FROM FireStations;"
    cursor = db.execute_query(db_connection=test_db_connection(), query=getQuery)
    fireList = cursor.fetchall()  # returns tuple of dicts

    # get list of police stations 
    getQuery = "SELECT `policeStationId` FROM PoliceStations;"
    cursor = db.execute_query(db_connection=test_db_connection(), query=getQuery)
    policeList = cursor.fetchall()  # returns tuple of dicts

    # get list of schools
    getQuery = "SELECT `schoolId`, `sName` FROM Schools;"
    cursor = db.execute_query(db_connection=test_db_connection(), query=getQuery)
    schoolList = cursor.fetchall()  # returns tuple of dicts

    # get list of social services
    getQuery = "SELECT `socialServiceId` FROM SocialServices;"
    cursor = db.execute_query(db_connection=test_db_connection(), query=getQuery)
    socialList = cursor.fetchall()  # returns tuple of dicts

    return render_template("updateDistrict.html", fires=fireList, polices=policeList, schools=schoolList, socials=socialList)

@app.route('/updatePolice')
def updatePolice():
    return render_template("updatePolice.html")

@app.route('/updateFire')
def updateFire():
    return render_template("updateFire.html")

@app.route('/updateSchool')
def updateSchool():
    return render_template("updateSchool.html")

@app.route('/updateSocial')
def updateSocial():
    return render_template("updateSocial.html")


@app.route('/updateDistrictSchool', methods=['POST'])
def updateDistrictSchool():
    """accepts a POST request object in standard format and sends a query to the DB and returns the table
    contents in an object"""
    return {}

@app.route('/updateSchoolDistrict', methods=['POST'])
def updateSchoolDistrict():
    """accepts a POST request object in standard format and sends a query to the DB and returns the table
    contents in an object"""
    return {}

@app.route('/getRows', methods=['POST'])
def getRows():
    '''
    status = 500
    if request.method == 'POST':
        # print received data for debugging
        print("")
        print(request.json)
        print("")
        status = 200
    return {'status': status}
    '''
    getRequest = request.get_json()
    print("getRequest:", getRequest)

    if getRequest['isSearch'] == 0:
        getQuery = "SELECT * FROM %s;" % (getRequest['table'])
    else:
        # assumes we are only having a search filter on the updateDistrict page
        getRequest['min'] = float(getRequest['min'])
        getRequest['max'] = float(getRequest['max'])
        getQuery = "SELECT * FROM CityDistricts WHERE districtBudget BETWEEN %1.2f AND %1.2f;" % (getRequest['min'], getRequest['max'])

    cursor = db.execute_query(db_connection=test_db_connection(), query=getQuery)
    results = cursor.fetchall()  # returns tuple of dicts

    return {'table': getRequest['table'], 'data': results}  # results will be converted to a list of dicts

    
    
@app.route('/addRows', methods=['POST'])
def addRows():
    '''
    status = 500
    if request.method == 'POST':
        # print received data for debugging
        print("")
        print(request.json)
        print("")
        status = 200
    return {'status': status}
    '''
    insertRequest = request.get_json()
    data_of_request = insertRequest['data']
	

    if insertRequest['table'] == 'FireStations':
        data_of_request['fCost'] = float(data_of_request['fCost'])
        insertQuery = "INSERT INTO FireStations (fName, fCost) VALUES ('%s', %1.2f);" % (data_of_request['fName'], data_of_request['fCost'])

    elif insertRequest['table'] == 'PoliceStations':
        data_of_request['pCost'] = float(data_of_request['pCost'])
        insertQuery = "INSERT INTO PoliceStations (pName, pCost) VALUES ('%s', %1.2f);" % (data_of_request['pName'], data_of_request['pCost'])

    elif insertRequest['table'] == 'Schools':
        data_of_request['sCost'] = float(data_of_request['sCost'])
        insertQuery = "INSERT INTO Schools (sName, sCost) VALUES ('%s', %1.2f);" % (data_of_request['sName'], data_of_request['sCost'])

    elif insertRequest['table'] == 'SocialServices':
        data_of_request['sSCost'] = float(data_of_request['sSCost'])
        insertQuery = "INSERT INTO SocialServices (serviceType, sSCost) VALUES ('%s', %1.2f);" % (data_of_request['serviceType'], data_of_request['sSCost'])

    elif insertRequest['table'] == 'CityDistricts':
        data_of_request['fStationId'] = int(data_of_request['fStationId'])
        data_of_request['pStationId'] = int(data_of_request['pStationId'])
        data_of_request['sServiceId'] = int(data_of_request['sServiceId'])
        data_of_request['districtBudget'] = float(data_of_request['districtBudget'])
        insertQuery = "INSERT INTO CityDistricts (dName, fStationId, pStationId, sServiceId, districtBudget) VALUES ('%s', %d, %d, %d, %1.2f);" % (data_of_request['dName'], data_of_request['fStationId'], data_of_request['pStationId'], data_of_request['sServiceId'], data_of_request['districtBudget'])

    elif insertRequest['table'] == 'SchoolsToCityDistricts':
        data_of_request['sId'] = int(data_of_request['sId'])
        data_of_request['cDId'] = int(data_of_request['cDId'])
        insertQuery = "INSERT INTO SchoolsToCityDistricts (sId, cDId) VALUES (%s, %s);" % (data_of_request['sId'], data_of_request['cDId'])


    cursor = db.execute_query(db_connection=test_db_connection(), query=insertQuery)
    results = cursor.fetchall()  # returns tuple of dicts

    return {'table': insertRequest['table'], 'data': results}  # results will be converted to a list of dicts


@app.route('/getRowsAgg', methods=['POST'])
def getRowsAgg():
    '''
    status = 500
    if request.method == 'POST':
        # print received data for debugging
        print("")
        print(request.json)
        print("")
        status = 200
    return {'status': status}
    '''
    getAggRequest = request.get_json()
    print("getAggRequest:", getAggRequest)

    if getAggRequest['groupUp'] == 'Schools':
        getAggQuery = "SELECT dName, GROUP_CONCAT(DISTINCT sName ORDER BY sName ASC SEPARATOR ' | ') AS sName FROM (SELECT dName, sName FROM CityDistricts AS d INNER JOIN SchoolsToCityDistricts AS ds ON d.cityDistrictId = ds.cDId INNER JOIN Schools AS s ON ds.sId = s.schoolId) dTs GROUP BY dName;"

    '''
    # actually used ???
    elif getAggRequest['groupUp'] == 'SocialServices':
        getAggQuery = "SELECT dName, serviceType FROM CityDistricts AS d INNER JOIN SocialServices AS ss ON d.sServiceId = ss.socialServiceId ORDER BY dName;"
    '''

    cursor = db.execute_query(db_connection=test_db_connection(), query=getAggQuery)
    results = cursor.fetchall()  # returns tuple of dicts

    return {'table': getAggRequest['groupUp'], 'data': results}  # results will be converted to a list of dicts


@app.route('/editRows', methods=['POST'])
def editRows():
    '''
    status = 500
    if request.method == 'POST':
        # print received data for debugging
        print("")
        print(request.json)
        print("")
        status = 200
    return {'status': status}
    '''
    updateRequest = request.get_json()
    data_of_request = updateRequest['data']

    # determine which table to update
    if updateRequest['table'] == 'FireStations':
        data_of_request['fCost'] = float(data_of_request['fCost'])
        data_of_request['fireStationId'] = int(data_of_request['fireStationId'])
        updateQuery = "UPDATE FireStations SET fName='%s', fCost=%1.2f WHERE fireStationId=%d;" % (data_of_request['fName'], data_of_request['fCost'], data_of_request['fireStationId'])

    elif updateRequest['table'] == 'PoliceStations':
        data_of_request['pCost'] = float(data_of_request['pCost'])
        data_of_request['policeStationId'] = int(data_of_request['policeStationId'])
        updateQuery = "UPDATE PoliceStations SET pName='%s', pCost=%1.2f WHERE policeStationId=%d;" % (data_of_request['pName'], data_of_request['pCost'], data_of_request['policeStationId'])

    elif updateRequest['table'] == 'Schools':
        data_of_request['sCost'] = float(data_of_request['sCost'])
        data_of_request['schoolId'] = int(data_of_request['schoolId'])
        updateQuery = "UPDATE Schools SET sName='%s', sCost=%1.2f WHERE schoolId=%d;" % (data_of_request['sName'], data_of_request['sCost'], data_of_request['schoolId'])

    elif updateRequest['table'] == 'SocialServices':
        data_of_request['sSCost'] = float(data_of_request['sSCost'])
        data_of_request['socialServiceId'] = int(data_of_request['socialServiceId'])
        updateQuery = "UPDATE SocialServices SET serviceType='%s', sSCost=%1.2f WHERE socialServiceId=%d;" % (data_of_request['serviceType'], data_of_request['sSCost'], data_of_request['socialServiceId'])

    elif updateRequest['table'] == 'CityDistricts':
        data_of_request['fStationId'] = int(data_of_request['fStationId'])
        data_of_request['pStationId'] = int(data_of_request['pStationId'])
        data_of_request['sServiceId'] = int(data_of_request['sServiceId'])
        data_of_request['districtBudget'] = float(data_of_request['districtBudget'])
        data_of_request['cityDistrictId'] = int(data_of_request['cityDistrictId'])
        updateQuery = "UPDATE CityDistricts SET dName='%s', fStationId=%d, pStationId=%d, sServiceId=%d, districtBudget=%d WHERE cityDistrictId=%d;" % (data_of_request['dName'], data_of_request['fStationId'], data_of_request['pStationId'], data_of_request['sServiceId'], data_of_request['districtBudget'], data_of_request['cityDistrictId'])

    '''
    elif updateRequest['table'] == 'SchoolsToCityDistricts':
        data_of_request['sId'] = int(data_of_request['sId'])
        data_of_request['cDId'] = int(data_of_request['cDId'])
        data_of_request['sCDId'] = int(data_of_request['sCDId'])
        updateQuery = "UPDATE SchoolsToCityDistricts SET sId=%d, cDId=%d WHERE sCDId=%d;" % (data_of_request['sId'], data_of_request['cDId'], data_of_request['sCDId'])
    '''

    cursor = db.execute_query(db_connection=test_db_connection(), query=updateQuery)
    results = cursor.fetchall()  # returns tuple of dicts

    return {'table': updateRequest['table'], 'data': results}  # results will be converted to a list of dicts



    
@app.route('/deleteRows', methods=['POST'])
def deleteRows():
    '''
    status = 500
    if request.method == 'POST':
        # print received data for debugging
        print("")
        print(request.json)
        print("")
        status = 200
    return {'status': status}
    '''
    deleteRequest = request.get_json()
    data_of_request = deleteRequest['data']

    # determine which table to make a deletion
    if deleteRequest['table'] == 'FireStations':
        deleteQuery = "DELETE FROM FireStations WHERE fireStationId=%s;" % (data_of_request['fireStationId'])

    elif deleteRequest['table'] == 'PoliceStations':
        deleteQuery = "DELETE FROM PoliceStations WHERE policeStationId=%s;" % (data_of_request['policeStationId'])

    elif deleteRequest['table'] == 'Schools':
        deleteQuery = "DELETE FROM Schools WHERE schoolId=%s;" % (data_of_request['schoolId'])

    elif deleteRequest['table'] == 'SocialServices':
        deleteQuery = "DELETE FROM SocialServices WHERE socialServiceId=%s;" % (data_of_request['socialServiceId'])

    elif deleteRequest['table'] == 'CityDistricts':
        deleteQuery = "DELETE FROM CityDistricts WHERE cityDistrictId=%s;" % (data_of_request['cityDistrictId'])

    elif deleteRequest['table'] == 'SchoolsToCityDistricts':
        data_of_request['sId'] = int(data_of_request['sId'])
        data_of_request['cDId'] = int(data_of_request['cDId'])
        deleteQuery = "DELETE FROM SchoolsToCityDistricts WHERE sId=%d AND cDId=%d;" % (data_of_request['sId'], data_of_request['cDId'])


    cursor = db.execute_query(db_connection=test_db_connection(), query=deleteQuery)
    results = cursor.fetchall()  # returns tuple of dicts

    return {'table': deleteRequest['table'], 'data': results}  # results will be converted to a list of dicts



def test_db_connection():
    """
    Will check if a DB connection exists. If it does not, make a new connection and return the DB connection object.
    Used when a DB query is about to be sent from backend to class’ DB.
    """
    try:
        db_connection.ping(reconnect=True, attempts=3, delay=5)
    except:
        db_connection = db.connect_to_database()

    return db_connection





if __name__ == "__main__":
    port = int(os.environ.get('PORT', 4400))

    app.run(port=port, debug=True)

