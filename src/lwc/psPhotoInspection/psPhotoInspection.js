import { LightningElement, api, track} from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import APP_RESOURCES from '@salesforce/resourceUrl/PSPhotoInspection';
import getMetaFieldDesc from '@salesforce/apex/PSPhotoInspectionController.getMetaFieldDesc';
import saveInspection from '@salesforce/apex/PSPhotoInspectionController.saveInspection';

export default class PsPhotoInspection extends LightningElement {
    cameraIconUrl = APP_RESOURCES + '/cameraIcon1.png';
    latitude;
    longitude;
    @track showSpinner = false;
    @api recordId;
    @api imageSize = 300;
    @api message = 'Click here to take a picture';
    @api childObject = null;
    @api childParentField = null;
    @api childFields = null;
    @api latField = null;
    @api lngField = null;
    @api saveText = 'Save';
    @api clearText = 'Clear';

    @track filterFields;

    _imgFile = null;

    connectedCallback() {
        var self = this;

        navigator.geolocation.getCurrentPosition(function(location) {
          console.log('lat=' + location.coords.latitude);
          console.log('lng=' + location.coords.longitude);
          self.latitude = location.coords.latitude;
          self.longitude = location.coords.longitude;
        });

        loadScript(this, APP_RESOURCES + '/ConversionJS.js');

        console.log('getting metadata info...');
        getMetaFieldDesc({objtype: this.childObject, filterFields: this.childFields}).then(result => {
           console.log('filterFields=' + result);
           this.filterFields = JSON.parse(result);
        })
        .catch(error => {
            console.log('error=' + JSON.stringify(error));
        });
    }

    cameraClick() {
        console.log('cameraClick...');
        this.template.querySelector('.cameraInput').click();
    }

    fileChange() {
        console.log('fileChange...');

        var input = this.template.querySelector('.cameraInput');
        var curFiles = input.files;
        
        if (curFiles.length === 1)
        {
            this._imgFile = curFiles[0];
            
            var myimg = this.template.querySelector('.myimg');
         
            myimg.src = window.URL.createObjectURL (curFiles[0]);
            
            this.template.querySelector('.cameraDiv').classList.add("hide");
            this.template.querySelector('.fileFormDiv').classList.remove("hide");
        }
    }

    handleFieldChange(event) {
        console.log('handleFieldChange...');
        console.log('name=' + event.detail.name + ' value=' + event.detail.value);

        this.filterFields.forEach(fld => {
            if (fld.name === event.detail.name)
            {
                fld.value = event.detail.value;
            }
        });
        console.log('filterFields=' + JSON.stringify(this.filterFields));
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
            let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
            if ((encoded.length % 4) > 0) 
            {
              encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
      });
    }

    saveFile() {
        var self = this;
        console.log('saveFile...');
        console.log('filterFields=' + JSON.stringify(this.filterFields));

        var params = [];
        this.filterFields.forEach(fld => {
          if (fld.value != null && fld.value.length > 0)
          {
              var p = {};
              p.name = fld.name;
              p.type = fld.ftype;
              p.value = fld.value;
              params.push(p); 
          }
        });

        if (this.latitude != null && this.latField != null) {
           params.push({name: this.latField, type: 'double', value: this.latitude});
        }

        if (this.longitude != null && this.lngField != null) {
            params.push({name: this.lngField, type: 'double', value: this.longitude});
         }

        console.log('params=' + JSON.stringify(params));

        
        self.showSpinner = true;
        
        this.getBase64(this._imgFile).then(function(data) {
    
            saveInspection({parentId: self.recordId, childObject: self.childObject, parentField: self.childParentField, params: JSON.stringify(params), base64Data: data, fileType: self._imgFile.type}).then(result => {
                console.log('saveInspection result=' + result);
                self.clear();
             })
             .catch(err => {
                 self.handleError(err);
             });
        });
        
    }

    onImageLoad() {
        var self = this;
        console.log('onImageLoad...');
        var myimg = this.template.querySelector('.myimg');
        var platform = window.navigator.platform;
        var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        console.log('platform = ' + platform);
        
        var orientation = 0;
        if (iosPlatforms.indexOf(platform) !== -1)
        {
            if (myimg.naturalWidth > myimg.naturalHeight) {
                orientation = 0;    // landscape
            } else if (myimg.naturalWidth < myimg.naturalHeight) {
                orientation = 6;     // portrait
            } else {
                orientation = 0;         // even
            }
        }
        console.log('orientation=' + orientation);
        console.log('myimg.src=' + myimg.src);

        var config = {size: this.imageSize, orientation: orientation};
        imageConversion.compressAccurately(this._imgFile, config).then(function(res) {
            console.log(res);
            console.log('size = ' + res.size);
            console.log('type = ' + res.type);
            console.log('name = ' + res.name);
            
            self._imgFile = res;
        }, function(err) {
            self.handleError(err);
        });

    }

    clear() {
        this.showSpinner = false;

        // switch UI: show camera icon
        this.template.querySelector('.fileFormDiv').classList.add("hide");
        this.template.querySelector('.cameraDiv').classList.remove("hide");

        // clear our previous image details
        this._imgFile = null;
        var input = this.template.querySelector('.cameraInput');
        input.value = "";

        // clear out previous field values
        this.filterFields.forEach(fld => {
            fld.value = null;
        });
        this.filterFields = JSON.parse(JSON.stringify(this.filterFields));
        
        console.log('filterFields=' + JSON.stringify(this.filterFields));
    }

    handleError(err)
    {
        console.log('error=' + err);
        console.log('type=' + typeof err);

        this.showSpinner = false;

        const event = new ShowToastEvent({
            title: err.statusText,
            message: err.body.message,
            variant: 'error',
            mode: 'pester'
        });
        this.dispatchEvent(event);
    }
}