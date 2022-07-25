

//structure:

//program receives string, then fetches patient info, then compiles the automated clicks and calls API
//eventually, this function will be triggered by the output of the speech rec on AWS. Within the script, this string parse function
//will lead to all other functions being called.
string_parse("order complete blood count")

function string_parse(input_string){
  let order = ""
  let priority = ""
  click_auto(order, priority)
}
click_auto("string","priority")
function click_auto(string, priority) {
  //default priority  = "NORMAL" or something
  let curr_patient = " "
  let curr_provider = " "
  let curr_time = " ";
  //string format: " complete blood count", e.g. just the test name, create parser after
  (function (window) {
    window.extractData = function () {
      var ret = $.Deferred();

      function onError() {
        console.log('Loading error', arguments);
        ret.reject();
      }

//TODO: Fetch address, symptoms (condition call) of patient
//TODO: Integrate google maps calls with patient zip
//TODO: Implement LOINC dictionary from the google sheet
//TODO: Create text processing pipeline
      function onReady(smart) {
        if (smart.hasOwnProperty('patient')) {
          console.log("has patient")
          var patient = smart.patient;
          var pt = patient.read();

          var conds = smart.patient.api.fetchAll({
            type: 'Observation',
            //query:{_count: 4}
            query: {}
          });
          var enc = conds.read()
          console.log(enc)
          var obv = smart.patient.api.fetchAll({
            type: 'Observation',
            query: {
              code: {
                $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
                  'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
                  'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
              }
            }
          });


          $.when(pt, conds).done(function (patient, conds) {
            console.log(obv.type);
          });

          console.log(obv)
          console.log(conds.status)
          console.log(conds.type)
          console.log(conds.type)
          console.log(conds.priority)


          $.when(pt, obv).fail(onError);
          $.when(pt, conds).fail(onError);


          $.when(pt, obv).done(function (patient, obv) {
            console.log("when statement")

            var byCodes = smart.byCodes(obv, 'code');
            var byCodesCond = smart.byCodes(conds, 'code');
            console.log(byCodes)
            console.log(byCodesCond('75323-6'))
            var gender = patient.address;

            var fname = '';
            var lname = '';

            if (typeof patient.name[0] !== 'undefined') {
              fname = patient.name[0].given.join(' ');
              lname = patient.name[0].family.join(' ');
            }

            var height = byCodes('8302-2');
            //gets the two types of blood pressures with the specified codes
            var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
            var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
            var hdl = byCodes('2085-9');
            var ldl = byCodes('2089-1');
            //sets p as a new empty patient object and populates it with the smart patient attributes
            var p = defaultPatient();
            p.birthdate = patient.birthDate;
            p.gender = gender;
            p.fname = fname;
            p.lname = lname;
            p.height = getQuantityValueAndUnit(height[0]);

            if (typeof systolicbp != 'undefined') {
              p.systolicbp = systolicbp;
            }

            if (typeof diastolicbp != 'undefined') {
              p.diastolicbp = diastolicbp;
            }

            p.hdl = getQuantityValueAndUnit(hdl[0]);
            p.ldl = getQuantityValueAndUnit(ldl[0]);

            ret.resolve(p);
          });
        } else {
          onError();
        }
      }

      FHIR.oauth2.ready(onReady, onError);
      return ret.promise();

    };

    function defaultPatient() {
      return {
        fname: {value: ''},
        conditions: {value: ''},
        lname: {value: ''},
        gender: {value: ''},
        birthdate: {value: ''},
        height: {value: ''},
        systolicbp: {value: ''},
        diastolicbp: {value: ''},
        ldl: {value: ''},
        hdl: {value: ''},
      };
    }

    function getBloodPressureValue(BPObservations, typeOfPressure) {
      var formattedBPObservations = [];
      BPObservations.forEach(function (observation) {
        var BP = observation.component.find(function (component) {
          return component.code.coding.find(function (coding) {
            return coding.code == typeOfPressure;
          });
        });
        if (BP) {
          observation.valueQuantity = BP.valueQuantity;
          formattedBPObservations.push(observation);
        }
      });

      return getQuantityValueAndUnit(formattedBPObservations[0]);
    }

//gets the value and unit from an observation
    function getQuantityValueAndUnit(ob) {
      if (typeof ob != 'undefined' &&
          typeof ob.valueQuantity != 'undefined' &&
          typeof ob.valueQuantity.value != 'undefined' &&
          typeof ob.valueQuantity.unit != 'undefined') {
        return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
      } else {
        return undefined;
      }
    }

    window.drawVisualization = function (p) {
      $('#holder').show();
      $('#loading').hide();
      $('#fname').html(p.fname);
      $('#lname').html(p.lname);
      $('#gender').html(p.gender);
      $('#conditions').html(p.conditions);
      $('#birthdate').html(p.birthdate);
      $('#height').html(p.height);
      $('#systolicbp').html(p.systolicbp);
      $('#diastolicbp').html(p.diastolicbp);
      $('#ldl').html(p.ldl);
      $('#hdl').html(p.hdl);
    };

  })(window);

  async function location_auto(zipcode) {
    //calls the API to get all viable locations
    //calls google maps API to find the shortest distance
    const response = await fetch('http://example.com/movies.json', {
      method: 'POST',
      body: myBody, // string or object
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const myJson = await response.json();
  }
  let justification = "TBD"
  let procedure_string = string
  let test_id = ""
  let body_site = ""
  let encounter_id = ""
  let notes = ""
  let array = [test_id, curr_patient, procedure_string, body_site, justification, encounter_id,  notes, curr_time, curr_provider, priority]
  return array
}
//Id
//Patient
//Procedure
//Body site
//Reason
//Scheduled for
//Patient encounter
//Performer
//Status of the request
//Notes
//As needed/PRN
//Ordered date/time
//Ordered by
//Priority


function click_automation(test_name){
  //build a dict of loinc codes

  return "code"
}
