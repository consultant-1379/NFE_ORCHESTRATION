package com.ericsson.oss.nfe.poc.tasks;

import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ACTIVE_PROVISIONING;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.BASE_ECM_URL_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.GET_VMS_FOR_VDC_URL_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ID_JSON_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.PROVISION_STATUS_KEY;

import java.net.URLEncoder;
import java.util.List;

import net.minidev.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.ECMRESTUtil;
import com.ericsson.oss.nfe.poc.utils.Utils;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;
import com.jayway.jsonpath.JsonPath;

public class DeleteVMS implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass()); 

	public void execute(DelegateExecution execution) {

		log.info("------------------------------DeleteVMS task started ----------------- ");

		String inputVDCId = (String)execution.getVariable("delVdcNameId");
		
		//String vdcId = inputVDCId = ((Map<String, String>)execution.getVariable(ECM_NAMEID_MAP)).get("EPG-VDC");

		try {
			if (!StringUtils.isEmpty(inputVDCId)) { 
				
				//Extract the VDC id from "TestVDC(vdc-11)" string
				String vdcID =Utils.extractVDCID(inputVDCId);
				
				String getVMSURL = AppConfigLoader
						.getProperty(GET_VMS_FOR_VDC_URL_KEY);

				// Build the filter key and then encode
				String filter = "vdcId='"
						+ vdcID+ "' 'and' tenantName='"+ AppConfigLoader.getProperty(
								"ecm.props.map.tenantName").trim() + "'";

				ResponseVO getVMSResponse = new ECMRESTUtil()
						.doGETRequest(getVMSURL + URLEncoder.encode(filter));

				List<JSONObject> vms = null;
				if (getVMSResponse.getJsonStr() != null && !("".equalsIgnoreCase(getVMSResponse.getJsonStr())))
				{
					vms = JsonPath.read(
				
						getVMSResponse.getJsonStr(), "$.vms");
				}
				if (vms != null && !vms.isEmpty()) {
					for (JSONObject vn : vms) {
						String status = (String) vn.get(PROVISION_STATUS_KEY);
						if (ACTIVE_PROVISIONING.equalsIgnoreCase(status)) {
							deleteVM((String) vn.get(ID_JSON_KEY));
						}
					}

				}
  

			}

		} catch (Exception e) {
			log.warn("Exeception during rest call to get Vms for VDC",e);

		}
  
		log.info("------------------------------DeleteVMS task Ended ----------------- ");

	}
	
	private void deleteVM(String vmID) {
		
		log.info("Deleting VM ----"+vmID);

		try {
			String deleteVM = AppConfigLoader
					.getProperty(BASE_ECM_URL_KEY)+"/vms/"+vmID;

			ResponseVO getVNSResponse = new ECMRESTUtil()
					.doDeleteRequest(deleteVM);
			
			log.info("Deleting VM success----"+vmID);

		} catch (Exception e) {
			log.warn(
					"Exeception deleteVM : {} ,ignoring as its ok",vmID,e);
 		} 
		 
	}
	
	 
}