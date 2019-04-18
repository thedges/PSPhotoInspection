# PSPhotoInspection
THIS SOFTWARE IS COVERED BY [THIS DISCLAIMER](https://raw.githubusercontent.com/thedges/Disclaimer/master/disclaimer.txt).

This package contains a Lightning component for performing photo-based inspections. Currently you need to setup as a Quick Action on a record and use from standard Salesforce Mobile app. It was developed as a Lightning Web Component so hopefully can utilize in Field Service Lightning at some point in future when they allow LWC extensions. 

![alt text](https://github.com/thedges/PSPhotoInspection/blob/master/PSPhotoInspection.gif "PSPhotoInspection")

This component works in following way:
* Inspector/user/agent would use quick action in SF mobile to launch component
* Take a picture of the issue
* Enter values in to configurable fields to associate to that photo
* Component creates a new child record for this specific inspection record, stores user entered data to fields on child record and stores geolocation
* Attaches the photo image to the new child record

It provides following key functionality:
* <b>Configurable Child Object</b> - specify the API name of child object to create new records for each photo inspection and attach photo to that record
* <b>Photo compression</b> - specify a target file size in KB for compressing large images to save on space and upload time
* <b>Configurable Fields</b> - specify a comma-separated list of fields on the target object to show in the edit form. An inspector can then provide values for each of these fields as each picture is taken.
* <b>Geolocation</b> - automatically capture the lat/lng of inspection location and store values in configurable lat/lng fields on child record

<b>Quick Action Setup</b>
While you can drop this component on a Lightning Page, it makes most sense to use it as a Quick Action in Salesforce Mobile. Once issue with Quick Actions is that you cannot configure them declaratively like you can when dropping a component on a page. To allow some dynamic configuration, I created a Custom Metadata type called "PSPhotoInspection" to store configutation parameters. The Quick Action logic will lookup the configuration in custom metadata configuration. The configuration has two options 

<b>Setup Instructions</b>
Here are steps to use this component:
  * Install the component per the "Deploy to Salesforce" button below
  * Setup users to have access to custom objects that drive the template. Either assign the permset "PSFileAttachTemplate" to your users  ...or... make sure users have read/write access to the PSFileAttachTemplate and PSFileAttachDef objects and PSFileAttachTemplate tab
  * Navigate to the PSFileAttachTemplate tab and create a new template. Give it a logical name as you will use this when configuring the Lightning Component later
  * For the template, create a list of file definitions for the files to attach to the record. Set the record fields (filename, required, description, etc...) as defined above
  * Drop the PSFileAttachTemplate Lightning Component on an internal or community page. Configure the Lightning Component and select the appropriate template name you specified earlier.

<b>Package Dependency</b>
Make sure to install these packages first in the order given:
  * [Lightning-Strike](https://github.com/thedges/Lightning-Strike)
  * [PSCommon](https://github.com/thedges/PSCommon)
  
<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>
