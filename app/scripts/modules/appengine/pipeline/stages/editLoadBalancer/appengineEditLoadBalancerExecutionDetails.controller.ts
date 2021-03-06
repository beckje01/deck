import {module} from 'angular';

import {EXECUTION_DETAILS_SECTION_SERVICE,
        ExecutionDetailsSectionService} from 'core/delivery/details/executionDetailsSection.service';
import {BaseExecutionDetailsCtrl,
        IExecutionDetailsScope} from 'core/pipeline/config/stages/core/baseExecutionDetails.controller';
import {IExecutionDetailsStateParams} from 'core/delivery/delivery.states';

class AppengineEditLoadBalancerExecutionDetailsCtrl extends BaseExecutionDetailsCtrl {
  static get $inject() { return ['$scope', '$stateParams', 'executionDetailsSectionService']; }

  constructor (public $scope: IExecutionDetailsScope,
               $stateParams: IExecutionDetailsStateParams,
               executionDetailsSectionService: ExecutionDetailsSectionService) {
    super($scope, $stateParams, executionDetailsSectionService);

    super.setScopeConfigSections(['editLoadBalancerConfig', 'taskStatus']);
    super.initialize();
  }
}

export const APPENGINE_EDIT_LOAD_BALANCER_EXECUTION_DETAILS_CTRL = 'spinnaker.appengine.editLoadBalancerExecutionDetails.controller';
module(APPENGINE_EDIT_LOAD_BALANCER_EXECUTION_DETAILS_CTRL, [
  require('angular-ui-router'),
  EXECUTION_DETAILS_SECTION_SERVICE,
  require('core/delivery/details/executionDetailsSectionNav.directive.js'),
]).controller('appengineEditLoadBalancerExecutionDetailsCtrl', AppengineEditLoadBalancerExecutionDetailsCtrl);
