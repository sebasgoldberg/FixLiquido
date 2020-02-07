import UIComponent from "sap/ui/core/UIComponent";
import Device from "sap/ui/Device";
import models from "./model/models";

export default UIComponent.extend("sap.ui.demo.basicTemplate.Component", {

	metadata: {
		manifest: "json"
	},

	testPolyfills: function () {
		[].map(x=>x);
		return new Promise( resolve => setTimeout(() => {
			resolve();
		}, 1));
	},

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
	 * @public
	 * @override
	 */
	init: async function() {
		// call the base component's init function
		UIComponent.prototype.init.apply(this, arguments);

		await this.testPolyfills();

		// set the device model
		this.setModel(models.createDeviceModel(), "device");

		// create the views based on the url/hash
		this.getRouter().initialize();
	}
});
