({
    getConfig : function(component) {
        var self = this;
        
        var action = component.get("c.getConfig"); 
        action.setParams({
            recordId: component.get("v.recordId")
        });

        action.setCallback(this, function(a) {
            var state = a.getState();
            if (state === "SUCCESS") {
                console.log('config=' + JSON.stringify(a.getReturnValue()));
                var config = a.getReturnValue();

                component.set("v.imageSize", config.imageSize);
                component.set("v.message", config.message);
                component.set("v.childObject", config.childObject);
                component.set("v.childParentField", config.childParentField);
                component.set("v.childFields", config.childFields);
                component.set("v.latField", config.latField);
                component.set("v.lngField", config.lngField);
                component.set("v.saveText", config.saveText);
                component.set("v.clearText", config.clearText);
                component.set("v.configReady", true);

            } else {
                self.handleErrors(component, a.getError());
            }
            
        });
        $A.enqueueAction(action); 
    },
    handleErrors: function (component, errors) {
        // Configure error toast
        let toastParams = {
            title: "Error!",
            message: "Unknown error", // Default error message
            type: "error",
            mode: "sticky"
        };
        // Pass the error message if any
        if (errors && Array.isArray(errors) && errors.length > 0) {
            toastParams.message = errors[0].message;
        }
        else
        {
            toastParams.message = errors;
        }
        // Fire error toast
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams(toastParams);
        toastEvent.fire();
    }
})