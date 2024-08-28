package com.ericsson.oss.nfe.poc.tasks;

import static com.ericsson.oss.nfe.poc.core.ApplicationConstants.BASE_ECM_URL_KEY;

import org.apache.commons.lang.StringUtils;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ericsson.oss.nfe.poc.listeners.AppConfigLoader;
import com.ericsson.oss.nfe.poc.utils.ECMRESTUtil;
import com.ericsson.oss.nfe.poc.utils.Utils;
import com.ericsson.oss.nfe.poc.utils.vo.ResponseVO;

public class DeleteVDCS implements JavaDelegate {

	private final Logger log = LoggerFactory.getLogger(getClass()); 

	public void execute(DelegateExecution execution) {

		log.info("------------------------------DeleteVDCS task started ----------------- ");

		String inputVDCId = (String)execution.getVariable("delVdcNameId");
		
		//String vdcId = inputVDCId = ((Map<String, String>)execution.getVariable(ECM_NAMEID_MAP)).get("EPG-VDC");

		try {
			if (!StringUtils.isEmpty(inputVDCId)) { 
			
				//Extract the VDC id from "TestVDC(vdc-11)" string
				String vdcID =Utils.extractVDCID(inputVDCId);
 
				// Finally delete the VDC
				deleteVDC(vdcID);

			}

		} catch (Exception e) {
			log.warn("Exeception during rest call to get Vms for VDC",e);

		}
  
		log.info("------------------------------DeleteVDCS task Ended ----------------- ");

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