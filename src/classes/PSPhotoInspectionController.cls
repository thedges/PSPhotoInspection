global with sharing class PSPhotoInspectionController {
     @AuraEnabled
    global static Id saveInspection(Id parentId, String childObject, String parentField, String params, String base64Data, String fileType) 
    {
        System.debug('params=' + params);
 
        try
        {
            String title = 'Image_' + Datetime.now().format('yyyyMMdd_HHmmss');    
            
            ContentVersion conVer = new ContentVersion();
            conVer.ContentLocation = 'S';          // S specify this document is in SF, use E for external files
            conVer.PathOnClient = title + '.png';  // The files name, extension is very important here which will help the file in preview.
            conVer.Title = title;                  // Display name of the files
            conVer.VersionData = EncodingUtil.base64Decode(base64Data); 
            insert conVer;
            
            Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:conVer.Id].ContentDocumentId;
            
            SObject newSobject = Schema.getGlobalDescribe().get(childObject).newSObject();
            List<Map<String, String>> paramList = (List<Map<String, String>>)JSON.deserialize(params, List<Map<String, String>>.class);
            for (Map<String, String> pMap : paramList)
            {
                if (pMap.get('type') == 'boolean')
                {
                  newSobject.put(pMap.get('name'), Boolean.valueOf(pMap.get('value')));
                }
                else if (pMap.get('type') == 'datetime')
                {
                  String val = pMap.get('value');
                  if (val.length() == 24)
                  {
                      val = val.replace('T', ' ').replace('Z', ' ').trim();
                  }
                  newSobject.put(pMap.get('name'), DateTime.valueOfGmt(val));
                }
                else if (pMap.get('type') == 'date')
                {
                  newSobject.put(pMap.get('name'), Date.valueOf(pMap.get('value')));
                }
                else if (pMap.get('type') == 'double')
                {
                  newSobject.put(pMap.get('name'), Decimal.valueOf(pMap.get('value')));
                }
                else if (pMap.get('type') == 'percent')
                {
                  newSobject.put(pMap.get('name'), Decimal.valueOf(pMap.get('value')));
                }
                else if (pMap.get('type') == 'currency')
                {
                  newSobject.put(pMap.get('name'), Decimal.valueOf(pMap.get('value')));
                }
                else {
                  newSobject.put(pMap.get('name'), pMap.get('value'));
                }
            }
            newSobject.put(parentField, parentId);
            insert newSobject;
            
            //Create ContentDocumentLink
            ContentDocumentLink cDe = new ContentDocumentLink();
            cDe.ContentDocumentId = conDoc;
            cDe.LinkedEntityId = newSobject.Id;        // you can use objectId,GroupId etc
            cDe.ShareType = 'I';                 // Inferred permission, checkout description of ContentDocumentLink object for more details
            cDe.Visibility = 'InternalUsers';
            insert cDe;
            
            return newSobject.Id;
        }
        catch (Exception e)
        {
            throw new  AuraHandledException(e.getTypeName() + ' - ' + e.getMessage() + ' [Line: ' + e.getLineNumber() + ']');
        }
        
    }

    @AuraEnabled
    global static String getMetaFieldDesc(String objtype, String filterFields)
    {
        try 
        {
            return PSMetaUtils.getMetaFieldDesc2(objtype, filterFields);
        } 
        catch (Exception e) 
        {
             throw new  AuraHandledException(e.getTypeName() + ' - ' + e.getMessage() + ' [Line: ' + e.getLineNumber() + ']');
        }
    }

}