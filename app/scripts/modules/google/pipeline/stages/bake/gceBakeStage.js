'use strict';

import _ from 'lodash';
import {BAKERY_SERVICE} from 'core/pipeline/config/stages/bake/bakery.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.gce.bakeStage', [
  require('core/pipeline/config/pipelineConfigProvider.js'),
  require('./bakeExecutionDetails.controller.js'),
  BAKERY_SERVICE,
  require('core/pipeline/config/stages/bake/modal/addExtendedAttribute.controller.modal.js'),
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'bake',
      cloudProvider: 'gce',
      label: 'Bake',
      description: 'Bakes an image in the specified region',
      templateUrl: require('./bakeStage.html'),
      executionDetailsUrl: require('./bakeExecutionDetails.html'),
      executionLabelTemplateUrl: require('core/pipeline/config/stages/bake/bakeExecutionLabel.html'),
      extraLabelLines: (stage) => {
        return stage.masterStage.context.allPreviouslyBaked || stage.masterStage.context.somePreviouslyBaked ? 1 : 0;
      },
      defaultTimeoutMs: 60 * 60 * 1000, // 60 minutes
      validators: [
        { type: 'requiredField', fieldName: 'package', },
      ],
      restartable: true,
    });
  })
  .controller('gceBakeStageCtrl', function($scope, bakeryService, $q, authenticationService, settings, $uibModal) {

    $scope.stage.extendedAttributes = $scope.stage.extendedAttributes || {};
    $scope.stage.region = 'global';

    if (!$scope.stage.user) {
      $scope.stage.user = authenticationService.getAuthenticatedUser().name;
    }

    $scope.viewState = {
      loading: true,
    };

    function initialize() {
      $scope.viewState.providerSelected = true;
      $q.all({
        baseOsOptions: bakeryService.getBaseOsOptions('gce'),
        baseLabelOptions: bakeryService.getBaseLabelOptions(),
      }).then(function(results) {
        $scope.baseOsOptions = results.baseOsOptions.baseImages;
        $scope.baseLabelOptions = results.baseLabelOptions;

        if (!$scope.stage.baseOs && $scope.baseOsOptions && $scope.baseOsOptions.length) {
          $scope.stage.baseOs = $scope.baseOsOptions[0].id;
        }
        if (!$scope.stage.baseLabel && $scope.baseLabelOptions && $scope.baseLabelOptions.length) {
          $scope.stage.baseLabel = $scope.baseLabelOptions[0];
        }
        $scope.viewState.roscoMode = settings.feature.roscoMode;
        $scope.showAdvancedOptions = showAdvanced();
        $scope.viewState.loading = false;
      });
    }

    function showAdvanced() {
      let stage = $scope.stage;
      return !!(stage.templateFileName || (stage.extendedAttributes && _.size(stage.extendedAttributes) > 0) ||
        stage.varFileName || stage.baseAmi || stage.accountName);
    }

    function deleteEmptyProperties() {
      _.forOwn($scope.stage, function(val, key) {
        if (val === '') {
          delete $scope.stage[key];
        }
      });
    }

    this.addExtendedAttribute = function() {
      if (!$scope.stage.extendedAttributes) {
           $scope.stage.extendedAttributes = {};
      }
      $uibModal.open({
        templateUrl: require('core/pipeline/config/stages/bake/modal/addExtendedAttribute.html'),
        controller: 'bakeStageAddExtendedAttributeController',
        controllerAs: 'addExtendedAttribute',
        resolve: {
          extendedAttribute: function () {
            return {
              key: '',
              value: '',
            };
          }
        }
      }).result.then(function(extendedAttribute) {
          $scope.stage.extendedAttributes[extendedAttribute.key] = extendedAttribute.value;
      });
    };

    this.removeExtendedAttribute = function (key) {
      delete $scope.stage.extendedAttributes[key];
    };

    this.showTemplateFileName = function() {
      return $scope.viewState.roscoMode || $scope.stage.templateFileName;
    };

    this.showAccountName = function() {
      return $scope.viewState.roscoMode || $scope.stage.accountName;
    };

    this.showExtendedAttributes = function() {
      return $scope.viewState.roscoMode || ($scope.stage.extendedAttributes && _.size($scope.stage.extendedAttributes) > 0);
    };

    this.showVarFileName = function() {
      return $scope.viewState.roscoMode || $scope.stage.varFileName;
    };

    this.getBaseOsDescription = function(baseOsOption) {
      return baseOsOption.id + (baseOsOption.shortDescription ? ' (' + baseOsOption.shortDescription + ')' : '');
    };

    this.getHelpFieldContent = function(baseOsOption) {
      return baseOsOption.detailedDescription + (baseOsOption.isImageFamily ? ' (family)' : '');
    };

    $scope.$watch('stage', deleteEmptyProperties, true);

    initialize();
  });
