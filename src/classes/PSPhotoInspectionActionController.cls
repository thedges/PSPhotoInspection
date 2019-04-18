public with sharing class PSPhotoInspectionActionController {
    @AuraEnabled
    public static Map<String,Object> getConfig(Id recordId)
    {
        try {
            String sobjType = recordId.getSobjectType().getDescribe().getName();

            List<PSPhotoInspection__mdt> configList = [SELECT Id, Camera_Message__c, Child_Fields__c, Child_Object__c, Child_Parent_Field__c, Image_Size__c,
                                                              Latitude_Field__c, Longitude_Field__c, Save_Text__c, Clear_Text__c, Parent_Object__c, Profile__c
                                                         FROM PSPhotoInspection__mdt
                                                        WHERE Parent_Object__c = :sobjType];

            PSPhotoInspection__mdt setting;
            if (configList.size() == 1)
            {
                setting = configList[0];
            }
            else if (configList.size() > 1)
            {
              List<Profile> profileList = [SELECT Id, Name FROM Profile WHERE Id=:UserInfo.getProfileId() LIMIT 1];
              String profileName = profileList[0].Name;

              for (PSPhotoInspection__mdt cfg : configList)
              {
                  if (cfg.Profile__c == profileName)
                  {
                      setting = cfg;
                  }
              }
            }
            else 
            {
                throw new  AuraHandledException('No PSPhotoInspection configuration setting found!');
            }

            Map<String, Object> resp = new Map<String, Object>();
            resp.put('message', setting.Camera_Message__c);
            resp.put('childFields', setting.Child_Fields__c);
            resp.put('childObject', setting.Child_Object__c);
            resp.put('childParentField', setting.Child_Parent_Field__c);
            resp.put('imageSize', setting.Image_Size__c);
            resp.put('latField', setting.Latitude_Field__c);
            resp.put('lngField', setting.Longitude_Field__c);
            resp.put('saveText', setting.Save_Text__c);
            resp.put('clearText', setting.Clear_Text__c);
            resp.put('parentObject', setting.Parent_Object__c);

            return resp;
        } 
        catch (Exception e) {
          throw new  AuraHandledException(e.getTypeName() + ' - ' + e.getMessage() + ' [Line: ' + e.getLineNumber() + ']');
        }

    }
}