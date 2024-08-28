package com.ericsson.oss.nfe.poc.tasks;

import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ACTIVE_PROVISIONING;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.BASE_ECM_URL_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ECM_NAMEID_MAP;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.GET_VMS_FOR_VDC_URL_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.ID_JSON_KEY;
import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.PROVISION_STATUS_KEY;

import java.net.URLEncoder;
import java.util.List;
import java.util.Map;

import net.minidev.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.ECMRESTUtil;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;
import com.jayway.jsonpath.JsonPath;

public class CleanUpOrders implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass()); 

	public void execute(DelegateExecution execution) {

		log.info("------------------------------CleanUpOrders task started ----------------- ");

		String inputVDCId = (String)execution.getVariable("delVdcNameId");
		
		String vdcId = inputVDCId = ((Map<String, String>)execution.getVariable(ECM_NAMEID_MAP)).get("EPG-VDC-AFR");

		try {
			if (!StringUtils.isEmpty(inputVDCId)) { 
				
				String getVMSURL = AppConfigLoader
						.getProperty(GET_VMS_FOR_VDC_URL_KEY);

				// Build the filter key and then encode
				String filter = "vdcId='"
						+ vdcId+ "' 'and' tenantName='"+ AppConfigLoader.getProperty(
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
 
				// Finally delete the VDC
				deleteVDC(vdcId);

			}

		} catch (Exception e) {
			log.warn("Exeception during rest call to get Vms for VDC",e);

		}
  
		log.info("------------------------------CleanUpOrders task Ended ----------------- ");

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
	
	
	private void deleteVDC(String vdcID) {
		
		log.info("Deleting VDC ----"+vdcID);

		try {
			String deleteVM = AppConfigLoader
					.getProperty(BASE_ECM_URL_KEY)+"/vdcs/"+vdcID;

			ResponseVO getVNSResponse = new ECMRESTUtil()
					.doDeleteRequest(deleteVM);
			
			log.info("Deleting VDC success----"+vdcID);

		} catch (Exception e) {
			log.warn(
					"Exeception deleteVDC : {} ,ignoring as its ok",vdcID,e);
 		} 
		 
	}
}