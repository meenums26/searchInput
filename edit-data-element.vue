<template>
  <div class="edit-gde-wrapper" data-testid="edit-gde-wrapper">
    <section v-if="gdeInlineEdit">
      <div class="inline-edit-wrapper col">
        <div class="row">
          <div class="col">
            <div class="row">
              <div class="col-1 yellow text-center vertical-align-center">
                <input
                  id="toggle-simple-switch"
                  type="checkbox"
                  :checked="selectedCheckbox || allselectedCheckbox"
                  @click="checkData"
                />
              </div>
              <div class="col-4 blue">
                <div class="holder-with-validation-error">
                  <input
                    data-testid="gde-name-input"
                    type="text"
                    class="form-control"
                    maxlength="128"
                    :value="gdeName"
                    :class="{
                      'input-warning':
                        v$.gdeName.required.$invalid ||
                        v$.gdeName.unique.$invalid
                    }"
                    @input="
                      inlineEditInputChange(
                        $event.target.value,
                        inputNames.gdeName
                      )
                    "
                  />
                  <div
                    v-if="v$.gdeName.required.$invalid"
                    class="validation-warning"
                  >
                    <img
                      src="../../../assets/icons/sy-notification-warning-16-filled.svg"
                      alt="Warning"
                      class="warning-icon-margin-right"
                    />
                    {{ $t('gdsSidebar.validationErrors.gdeNameEmpty') }}
                  </div>
                  <div
                    v-if="v$.gdeName.unique.$invalid"
                    class="validation-warning"
                  >
                    <img
                      src="../../../assets/icons/sy-notification-warning-16-filled.svg"
                      alt="Warning"
                      class="warning-icon-margin-right"
                    />
                    {{ $t('gdsSidebar.validationErrors.gdeNameInvalid') }}
                  </div>
                </div>
                <div class="container file-attributes">
                  <DataElementMappedAttributes
                    :data-element="goldenDataElement"
                    :is-inline-edit="gdeInlineEdit"
                    :allowed-num-of-attributes="allowedNumOfAttributes"
                    :edit-request="editRequest"
                  />
                  <img
                    class="file-attributes--icon"
                    src="../../../assets/icons/sy-tools-pencil-gray.svg"
                    alt="edit icon"
                    @click="editLinkage"
                  />
                </div>
              </div>
              <div class="col-6 yellow">
                <div class="row">
                  <div class="col-10">
                    <TermsAndDefinitionsWrapper
                      :key="termId"
                      :is-inline="true"
                      :show-failed="true"
                      :term-id="termId"
                      :collection-id="collectionId"
                    />
                  </div>
                  <div class="col-2">
                    <EmGeneralPopover
                      width="310px"
                      max-height="300px"
                      position="right"
                    >
                      <template #reference>
                        <div>
                          <img
                            src="../../../assets/icons/sy-tools-pencil-gray.svg"
                            alt="edit icon"
                          />
                        </div>
                      </template>
                      <template #header>
                        <h3>{{ $t('gdsSidebar.termAndDefinitionBdm') }}</h3>
                      </template>
                      <template #body>
                        <div style="min-height: 200px">
                          <LabelWithInfoModal
                            :label-text="$t('gdsSidebar.collectionId')"
                            :sub-label-text="''"
                            :modal-title="$t('gdsSidebar.collectionId')"
                            :modal-html="$t('gdsSidebar.labelInfo.alexDef')"
                          />
                          <div class="holder-with-validation-error mb-2">
                            <input
                              type="number"
                              class="form-control"
                              :value="collectionId"
                              min="0"
                              onKeyPress="if(this.value.length>5) return false;"
                              oninput="validity.valid||(value='');"
                              @input="
                                updateAlexComponentInline(
                                  'collection_id',
                                  $event.target.value
                                )
                              "
                            />
                            <div
                              v-if="
                                v$.collectionId.required.$invalid &&
                                v$.collectionId.$dirty
                              "
                              class="validation-warning"
                            >
                              <img
                                src="../../../assets/icons/sy-notification-warning-16-filled.svg"
                                alt="Warning"
                                class="warning-icon-margin-right"
                              />
                              {{
                                $t(
                                  'gdsSidebar.validationErrors.collectionIdEmpty'
                                )
                              }}
                            </div>
                          </div>
                          <LabelWithInfoModal
                            :label-text="$t('gdsSidebar.termId')"
                            :sub-label-text="''"
                            :modal-title="$t('gdsSidebar.termId')"
                            :modal-html="$t('gdsSidebar.labelInfo.alexDef')"
                          />
                          <div class="holder-with-validation-error">
                            <input
                              type="number"
                              class="form-control"
                              onKeyPress="if(this.value.length>5) return false;"
                              :value="termId"
                              min="0"
                              oninput="validity.valid||(value='');"
                              @input="
                                updateAlexComponentInline(
                                  'term_id',
                                  $event.target.value
                                )
                              "
                            />
                            <div
                              v-if="
                                v$.termId.required.$invalid && v$.termId.$dirty
                              "
                              class="validation-warning"
                            >
                              <img
                                src="../../../assets/icons/sy-notification-warning-16-filled.svg"
                                alt="Warning"
                                class="warning-icon-margin-right"
                              />
                              {{
                                $t('gdsSidebar.validationErrors.termIdEmpty')
                              }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </EmGeneralPopover>
                  </div>
                </div>
              </div>
              <div class="col-1 blue text-center">
                <EmGeneralPopover
                  width="300px"
                  max-height="500px"
                  position="top"
                >
                  <template #reference>
                    <div>
                      <EmTooltip
                        :tooltip-text="$t('gdsSidebar.lifeCycle')"
                        :tooltip-position="'left'"
                        :theme="'dark'"
                      >
                        <img
                          src="../../../assets/icons/lifecycle/lifecycle-default.svg"
                          alt="lifecycle default"
                        />
                      </EmTooltip>
                    </div>
                  </template>
                  <template #header>
                    <h3>{{ $t('gdsSidebar.lifeCycle') }}</h3>
                  </template>
                  <template #body>
                    <div style="min-height: 200px">
                      <LabelWithInfoModal
                        :label-text="$t('gdsSidebar.lifeCycle')"
                        :modal-title="$t('gdsSidebar.lifeCycle')"
                        :modal-html="$t('gdsSidebar.labelInfo.lifeCycleInfo')"
                      />
                      <div class="holder-with-validation-error">
                        <DropDownComponent
                          :dropdown-data="lifeCycleDetails"
                          :enable-search-field="false"
                          :class="{
                            'input-warning':
                              v$.gdeLifecycleStatus.required.$invalid
                          }"
                          @onOptionSelected="
                            inlineDataElementOptionChanged($event, 'lifecycle')
                          "
                        />

                        <div
                          v-if="v$.gdeLifecycleStatus.required.$invalid"
                          class="validation-warning"
                        >
                          <img
                            src="../../../assets/icons/sy-notification-warning-16-filled.svg"
                            alt="Warning"
                            class="warning-icon-margin-right"
                          />
                          {{
                            $t('gdsSidebar.validationErrors.gdeLifeCycleEmpty')
                          }}
                        </div>
                      </div>
                    </div>
                  </template>
                </EmGeneralPopover>
                <IconSwitch
                  :on-icon="'cadm-sy-kde.svg'"
                  :off-icon="'cadm-sy-kde-inactive.svg'"
                  :unknown-icon="'cadm-sy-kde-unknown.svg'"
                  :is-checked="
                    isChecked(currentGoldenDataElement.key_element_indicator)
                  "
                  :tooltip-text="$t('gdsSidebar.keyDataElement')"
                  @toggleClicked="
                    toggleToDropDownMapper($event, 'key_element_indicator')
                  "
                />
                <IconSwitch
                  :on-icon="'cadm-sy-data-privacy.svg'"
                  :off-icon="'cadm-sy-data-privacy-inactive.svg'"
                  :unknown-icon="'cadm-sy-data-privacy-unknown.svg'"
                  :is-checked="
                    isChecked(
                      currentGoldenDataElement.potential_sensitive_element_indicator
                    )
                  "
                  :tooltip-text="$t('gdsSidebar.potentiallySensitiveDataElem')"
                  @toggleClicked="
                    toggleToDropDownMapper(
                      $event,
                      'potential_sensitive_element_indicator'
                    )
                  "
                />
                <IconSwitch
                  :on-icon="'cadm-sy-identifying-data-element.svg'"
                  :off-icon="'cadm-sy-identifying-data-element-inactive.svg'"
                  :unknown-icon="'cadm-sy-identifying-data-element-unknown.svg'"
                  :is-checked="
                    isChecked(
                      currentGoldenDataElement.identifying_element_indicator
                    )
                  "
                  :tooltip-text="$t('gdsSidebar.identifyingDataElement')"
                  @toggleClicked="
                    toggleToDropDownMapper(
                      $event,
                      'identifying_element_indicator'
                    )
                  "
                />
              </div>
            </div>
          </div>
          <div class="col align-self-center text-center">
            <div class="row">
              <div class="col-3 yellow vertical-align-center">
                <img
                  src="../../../assets/icons/sy-bar-chart-loader.svg"
                  alt="no icon"
                />
              </div>
              <div class="col-2 blue">
                <img
                  src="../../../assets/icons/sy-bar-chart-loader.svg"
                  alt="no icon"
                />
              </div>
              <div class="col yellow">
                <img
                  src="../../../assets/icons/sy-bar-chart-loader.svg"
                  alt="no icon"
                />
              </div>
              <div class="col blue">
                <EmGeneralPopover
                  width="300px"
                  max-height="400px"
                  position="top"
                >
                  <template #reference>
                    <IconSwitch
                      :on-icon="'cadm-sy-relation.svg'"
                      :off-icon="'cadm-sy-relation-inactive.svg'"
                      :unknown-icon="'cadm-sy-relation-unknown.svg'"
                      :is-checked="
                        isChecked(
                          currentGoldenDataElement.referring_element_indicator
                        )
                      "
                      :disable-click-toggle="true"
                      :tooltip-text="$t('gdsSidebar.refDataElement')"
                    />
                  </template>
                  <template #header>
                    <h3>{{ $t('gdsSidebar.refDataElement') }}</h3>
                  </template>
                  <template #body>
                    <div style="min-height: 220px">
                      <LabelWithInfoModal
                        :label-text="$t('gdsSidebar.refDataElement')"
                        :modal-title="$t('gdsSidebar.refDataElement')"
                        :modal-html="$t('gdsSidebar.labelInfo.refInfo')"
                      />
                      <EmLabelInfo :label="''" class="mb-2 includes-dropdown">
                        <ToggleSwitchSimple
                          :is-checked="
                            isChecked(
                              currentGoldenDataElement.referring_element_indicator
                            )
                          "
                          @toggleClicked="
                            toggleToDropDownMapper(
                              $event,
                              'referring_element_indicator'
                            )
                          "
                        />
                      </EmLabelInfo>
                      <LabelWithInfoModal
                        :label-text="$t('gdsSidebar.linkedRefDataElement')"
                        :modal-title="$t('gdsSidebar.linkedRefDataElement')"
                        :modal-html="
                          $t('gdsSidebar.labelInfo.linkedRefDataElementInfo')
                        "
                      />
                      <input
                        type="number"
                        class="form-control"
                        :class="{ disabled: isNoReferringFlag }"
                        min="0"
                        max="9999999999"
                        :disabled="isNoReferringFlag"
                        oninput="validity.valid||(value='');"
                        :value="linkageReferringId"
                        @input="
                          inlineEditInputChange(
                            $event.target.value,
                            inputNames.linkedReferringId
                          )
                        "
                      />
                    </div>
                  </template>
                </EmGeneralPopover>
              </div>
              <div class="col yellow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section v-if="!gdeInlineEdit" class="edit-gde">
      <EmLabelInfo
        v-if="!isAdded()"
        :label="$t('gdsSidebar.gdeId')"
        class="mb-4"
      >
        <div v-if="currentGoldenDataElement.data_element_id">
          {{ currentGoldenDataElement.data_element_id }}
        </div>
        <div v-else class="none-text">
          {{ $t('gdsSidebar.noneText') }}
        </div>
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.gdeName')"
        :modal-title="$t('gdsSidebar.labelInfo.gdeName')"
        :modal-html="$t('gdsSidebar.labelInfo.gdeNameInfo')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-field">
        <div class="holder-with-validation-error">
          <input
            data-testid="gde-name-input"
            type="text"
            class="form-control"
            maxlength="128"
            :value="gdeName"
            :class="{
              'input-warning':
                v$.gdeName.required.$invalid || v$.gdeName.unique.$invalid
            }"
            @input="
              dataElementInputChanged($event.target.value, inputNames.gdeName)
            "
          />
          <div v-if="v$.gdeName.required.$invalid" class="validation-warning">
            <img
              src="../../../assets/icons/sy-notification-warning-16-filled.svg"
              alt="Warning"
              class="warning-icon-margin-right"
            />
            {{ $t('gdsSidebar.validationErrors.gdeNameEmpty') }}
          </div>
          <div v-if="v$.gdeName.unique.$invalid" class="validation-warning">
            <img
              src="../../../assets/icons/sy-notification-warning-16-filled.svg"
              alt="Warning"
              class="warning-icon-margin-right"
            />
            {{ $t('gdsSidebar.validationErrors.gdeNameInvalid') }}
          </div>
        </div>
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.mappedAttributes')"
        :modal-title="$t('gdsSidebar.mappedAttributes')"
        :modal-html="$t('gdsSidebar.labelInfo.mappedDataAttrInfo')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-field">
        <div
          class="mapped-attibutes"
          data-testid="mapped-attibutes"
          @click="editLinkage"
        >
          <img
            class="mapped-attibutes--icon"
            src="../../../assets/icons/sy-tools-pencil-green.svg"
            alt="edit icon"
          />
          <template v-if="mappedAttributes.length > 0">
            <div
              v-for="(attr, index) in mappedAttributes"
              :key="index"
              class="attr-wrapper text-left"
              data-testid="attr-wrapper"
            >
              <div>
                <span
                  class="attr-name"
                  :class="isAttributeLinkageMarkedForDelete(attr)"
                  >{{ attr.column_name }}</span
                >
                <span class="attr-extension">{{ attr.file_extension }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="attr-wrapper blank-attr text-left">
              <div class="attr-name">
                {{ $t('gdsSidebar.emptyMappedAttributes') }}
              </div>
            </div>
          </template>
        </div>
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.collectionId')"
        :modal-title="$t('gdsSidebar.collectionId')"
        :modal-html="$t('gdsSidebar.labelInfo.alexDef')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-field">
        <div class="holder-with-validation-error">
          <input
            type="number"
            class="form-control"
            :value="collectionId"
            min="0"
            onKeyPress="if(this.value.length>5) return false;"
            oninput="validity.valid||(value='');"
            @input="updateAlexComponent('collection_id', $event.target.value)"
          />
          <div
            v-if="v$.collectionId.required.$invalid && v$.collectionId.$dirty"
            class="validation-warning"
          >
            <img
              src="../../../assets/icons/sy-notification-warning-16-filled.svg"
              alt="Warning"
              class="warning-icon-margin-right"
            />
            {{ $t('gdsSidebar.validationErrors.collectionIdEmpty') }}
          </div>
        </div>
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.termId')"
        :modal-title="$t('gdsSidebar.termId')"
        :modal-html="$t('gdsSidebar.labelInfo.alexDef')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-field">
        <div class="holder-with-validation-error">
          <input
            type="number"
            class="form-control"
            onKeyPress="if(this.value.length>5) return false;"
            :value="termId"
            min="0"
            oninput="validity.valid||(value='');"
            @input="updateAlexComponent('term_id', $event.target.value)"
          />
          <div
            v-if="v$.termId.required.$invalid && v$.termId.$dirty"
            class="validation-warning"
          >
            <img
              src="../../../assets/icons/sy-notification-warning-16-filled.svg"
              alt="Warning"
              class="warning-icon-margin-right"
            />
            {{ $t('gdsSidebar.validationErrors.termIdEmpty') }}
          </div>
        </div>
      </EmLabelInfo>
      <TermsAndDefinitionsWrapper
        v-if="canShowAlexWrapper"
        :key="termId"
        :show-failed="true"
        :edit-mode="true"
        :term-id="termId"
        :collection-id="collectionId"
        class="gde-alex mb-4"
      />
      <!-- Key Data Element -->
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.keyDataElement')"
        :modal-title="$t('gdsSidebar.keyDataElement')"
        :modal-html="$t('gdsSidebar.labelInfo.keyDataElementInfo')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-dropdown">
        <ToggleSwitchSimple
          @toggleClicked="
            toggleToDropDownMapper($event, 'key_element_indicator')
          "
          :is-checked="
            isChecked(currentGoldenDataElement.key_element_indicator)
          "
        />
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.potentiallySensitiveDataElem')"
        :modal-title="$t('gdsSidebar.potentiallySensitiveDataElem')"
        :modal-html="$t('gdsSidebar.labelInfo.psdInfo')"
      />
      <EmLabelInfo
        :label="''"
        class="mb-4 includes-dropdown"
        data-testid="gde-potentially-sensitive-dropdown"
      >
        <ToggleSwitchSimple
          @toggleClicked="
            toggleToDropDownMapper(
              $event,
              'potential_sensitive_element_indicator'
            )
          "
          :is-checked="
            isChecked(
              currentGoldenDataElement.potential_sensitive_element_indicator
            )
          "
        />
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.identifyingDataElement')"
        :modal-title="$t('gdsSidebar.identifyingDataElement')"
        :modal-html="$t('gdsSidebar.labelInfo.ideInfo')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-dropdown">
        <ToggleSwitchSimple
          @toggleClicked="
            toggleToDropDownMapper($event, 'identifying_element_indicator')
          "
          :is-checked="
            isChecked(currentGoldenDataElement.identifying_element_indicator)
          "
        />
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.refDataElement')"
        :modal-title="$t('gdsSidebar.refDataElement')"
        :modal-html="$t('gdsSidebar.labelInfo.refInfo')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-dropdown">
        <ToggleSwitchSimple
          @toggleClicked="
            toggleToDropDownMapper($event, 'referring_element_indicator')
          "
          :is-checked="
            isChecked(currentGoldenDataElement.referring_element_indicator)
          "
        />
      </EmLabelInfo>
      <LabelWithInfoModal
      :label-text="$t('gdsSidebar.linkedRefDataElement')"
      :modal-title="$t('gdsSidebar.linkedRefDataElement')"
      :modal-html="$t('gdsSidebar.labelInfo.linkedRefDataElementInfo')"
      />
      <EmLabelInfo :label="''" class="mb-4 includes-dropdown">
      <SearchBarComponent
      :id="'searchLinkedRefDataElement'"
      :class="{ disabled: isNoReferringFlag }"
      :pre-selected-search-term="linkageReferringId"
      :enable-clear-button="true"
      :enable-suggest-as-you-type="true"
      :is-loading="isSeacrhLoading"
      :search-suggestions="suggestionList"
      :placeholder="$t('gdsSidebar.searchLinkedRefDataElement')"
      class="searchComponent"
      @onSearch="onSearch"
      @onSuggestionSelection="onSuggestionSelected"
      />
      </EmLabelInfo>
      <!-- <EmLabelInfo :label="''" class="mb-4 includes-dropdown">
        <input
          type="number"
          class="form-control"
          :class="{ disabled: isNoReferringFlag }"
          min="0"
          max="9999999999"
          :disabled="isNoReferringFlag"
          oninput="validity.valid||(value='');"
          :value="linkageReferringId"
          @input="
            dataElementInputChanged(
              $event.target.value,
              inputNames.linkedReferringId
            )
          "
        />
      </EmLabelInfo> -->
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.lifeCycle')"
        :modal-title="$t('gdsSidebar.lifeCycle')"
        :modal-html="$t('gdsSidebar.labelInfo.lifeCycleInfo')"
      />
      <EmLabelInfo
        :label="''"
        class="mb-4 includes-dropdown"
        data-testid="gde-lifecycle-dropdown"
      >
        <div class="holder-with-validation-error">
          <DropDownComponent
            :dropdown-data="lifeCycleDetails"
            :enable-search-field="false"
            :class="{
              'input-warning': v$.gdeLifecycleStatus.required.$invalid
            }"
            @onOptionSelected="dataElementOptionChanged($event, 'lifecycle')"
          />

          <div
            v-if="v$.gdeLifecycleStatus.required.$invalid"
            class="validation-warning"
          >
            <img
              src="../../../assets/icons/sy-notification-warning-16-filled.svg"
              alt="Warning"
              class="warning-icon-margin-right"
            />
            {{ $t('gdsSidebar.validationErrors.gdeLifeCycleEmpty') }}
          </div>
        </div>
      </EmLabelInfo>
      <LabelWithInfoModal
        :label-text="$t('gdsSidebar.externalOriginatedDataElem')"
        :modal-title="$t('gdsSidebar.externalOriginatedDataElem')"
        :modal-html="$t('gdsSidebar.labelInfo.externalOriginatedDataElemInfo')"
      />
      <EmLabelInfo :label="''" class="mb-6 includes-dropdown">
        <ToggleSwitchSimple
          @toggleClicked="
            toggleToDropDownMapper($event, 'external_element_indicator')
          "
          :is-checked="
            isChecked(currentGoldenDataElement.external_element_indicator)
          "
        />
      </EmLabelInfo>
      <div v-if="enableGDEDataRetention">
        <LabelWithInfoModal
          :label-text="$t('gdsSidebar.extendableByRetentionPeriod')"
          :modal-title="$t('gdsSidebar.extendableByRetentionPeriod')"
          :modal-html="
            $t('gdsSidebar.labelInfo.extendableByRetentionPeriodInfo')
          "
        />
        <EmLabelInfo
          :label="''"
          class="mb-4 includes-dropdown"
          data-testid="gde-retention-period-boolean"
        >
          <ToggleSwitchSimple
            :is-checked="
              isChecked(
                currentGoldenDataElement.extendable_by_required_retention_period ||
                  null
              )
            "
            @toggleClicked="
              toggleToDropDownMapper(
                $event,
                'extendable_by_required_retention_period'
              )
            "
          />
        </EmLabelInfo>
        <LabelWithInfoModal
          :label-text="$t('gdsSidebar.gdeRetentionPeriod')"
          :modal-title="$t('gdsSidebar.gdeRetentionPeriod')"
          :modal-html="$t('gdsSidebar.labelInfo.gdeRetentionPeriodInfo')"
        />
        <EmLabelInfo
          :label="''"
          class="mb-4 includes-dropdown"
          data-testid="gde-retention-period-number"
        >
          <input
            data-testid="gde-retention-period-number"
            type="number"
            class="form-control"
            min="0"
            :value="currentGoldenDataElement.gde_retention_period"
            @input="
              dataElementInputChanged(
                $event.target.value,
                inputNames.gdeRetentionPeriod
              )
            "
          />
        </EmLabelInfo>
      </div>
      <div>
        <LabelWithInfoModal
          :label-text="$t('gdsSidebar.isDerivedData')"
          :modal-title="$t('gdsSidebar.isDerivedData')"
          :modal-html="$t('gdsSidebar.labelInfo.isDerivedData')"
        />
        <EmLabelInfo :label="''" class="mb-8 includes-dropdown">
          <span
            v-if="isDerivedData"
            class="text-left ft-16 line-height-24 mt-1"
          >
            {{ isDerivedData }}
          </span>
          <span
            v-else
            class="text-left natural-text-200 line-height-24 ft-16 noDataRed"
          >
            {{ $t('details.sideBar.preview.notAvailable') }}
          </span>
        </EmLabelInfo>
      </div>
    </section>
    <section v-if="!gdeInlineEdit" class="edit-gde-footer">
      <AutoSaveIndicator :is-saving="autosaving" />
      <EmButton
        v-if="!isAdded()"
        class="btn-secondary mx-1"
        data-testid="edit-element-revert-button"
        :disabled="!enableRevert"
        :on-click="revertChanges"
      >
        {{ $t('gdsSidebar.revertChanges') }}
      </EmButton>
      <EmButton
        class="btn-primary"
        data-testid="edit-element-save-button"
        :disabled="disableSaveAndClose"
        :on-click="saveAndClose"
      >
        {{ $t('gdsSidebar.saveAndClose') }}
      </EmButton>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { EventBus } from '@/common/event-bus';
import Utils from '@/common/utilities';
import deepCopy from '@/common/utils/deepCopy';
import IconSwitch from '@/components/icon-switch.vue';
import ToggleSwitchSimple from '@/components/toggle-switch-simple.vue';
import { DropDown } from '@/core/modules/search';
import DropDownComponent from '@/datasetView/components/shared/DropDownComponent.vue';
import AutoSaveIndicator from '@/components/auto-save-indicator.vue';
import {
  Attribute,
  DatasetEditAction,
  DatasetElementEditAnalyticsProperties,
  DatasetEvent,
  LinkedElement
} from '@/datasetView/model';
import { GdsValidationUtil } from '@/datasetView/utilities/gds-validation.util';
import { gdsEditWorkflowUtil } from '@/datasetView/utilities/gdsEditWorkflow.utils';
import {
  EmButton,
  EmIcon,
  EmInput,
  EmLabelInfo,
  EmLoader,
  EmGeneralPopover
} from '@aab/vue-shared-components';
import SearchBarComponent from '@/datasetView/components/shared/SearchBarComponent.vue';
import { required, requiredIf } from '@vuelidate/validators';

import { EmTooltip } from '@aab/vue-shared-components';
import useVuelidate from '@vuelidate/core';
import { defineProps, PropType, Ref, ref, defineEmits, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnalytics, useStorage } from '@/core/plugin';
import { ENABLE_GDE_DATA_RETENTION } from '@/common/constants';
import store from '@/plugins/global.store';
import { EDataSetEventType } from '@/datasetView/analytics';
import {
  DropdownData,
  EditLinkageElementAndAttribute,
  EDIT_LINKAGE_FLAG,
  EDIT_REQUEST_ACTION
} from '../../../model';
import * as types from '../../../store/index';
import TermsAndDefinitionsWrapper from '../../shared/DataElements/terms-and-definitions/components/terms-and-definitions-wrapper.vue';
import { GdsSidebarMapper } from '../mapper/gds-sidebar.mapper';
import {
  GdeLifecycleStatus,
  GdsSidebarType
} from '../models/gds-sidebar.model';
import { GdsSidebarStorage } from '../storage/gds-sidebar.storage';
import LabelWithInfoModal from './label-with-info-modal.vue';
import DataElementMappedAttributes from '../../shared/DataElements/components/data-element-mapped-attributes.vue';
import {
  ENotification,
  ENotificationType
} from '../../../../../common/constants/enums/events';

const { t } = useI18n();

const emit = defineEmits(['checkboxClicked']);

const analytics = useAnalytics();

const storage = useStorage();

const props = defineProps({
  gdeInlineEdit: { type: Boolean, default: false, required: false },
  goldenDataElement: {
    type: Object as PropType<LinkedElement>,
    required: false,
    default: () => ({})
  },
  allselectedCheckbox: { type: Boolean, default: false },
  allowedNumOfAttributes: { type: Number, required: false }
});

/* eslint-disable camelcase */
const inputNames = {
  gdeName: 'data_element_name',
  linkedReferringId: 'referring_element_id',
  gdeRetentionPeriod: 'gde_retention_period'
};

/* -------------------------------------Refs---------------------*/

const suggestionList = ref<Array<any>>([]);
 const isSeacrhLoading = ref(false);

const keyDataElement: Ref<DropdownData[]> = ref([
  {
    label: 'Yes',
    value: 'Yes',
    isSelected: false
  },
  {
    label: 'No',
    value: 'No',
    isSelected: false
  }
]);

const identifyingDataElement: Ref<DropdownData[]> = ref([
  {
    label: 'Yes',
    value: 'Yes',
    isSelected: false
  },
  {
    label: 'No',
    value: 'No',
    isSelected: false
  }
]);

const refDataElement: Ref<DropdownData[]> = ref([
  {
    label: 'Yes',
    value: 'Yes',
    isSelected: false
  },
  {
    label: 'No',
    value: 'No',
    isSelected: false
  }
]);

/**
 * This attribute not being used anywhere
const purposeRefDataElem: Ref<DropdownData[]> = ref([
  {
    label: 'Enterprise Reference Data',
    value: 'Enterprise Reference Data',
    isSelected: false
  },
  {
    label: 'Enterprise Party Reference',
    value: 'Enterprise Party Reference',
    isSelected: false
  },
  {
    label: 'Global Organisational Data',
    value: 'Global Organisational Data',
    isSelected: false
  },
  {
    label: 'Other Data Element in Golden Dataset',
    value: 'Other Data Element in Golden Dataset',
    isSelected: false
  }
]);
*/

const externalDataElem: Ref<DropdownData[]> = ref([
  {
    label: 'Yes',
    value: 'Yes',
    isSelected: false
  },
  {
    label: 'No',
    value: 'No',
    isSelected: false
  }
]);

const lifeCycleDetails: Ref<DropdownData[]> = ref([
  {
    label: GdeLifecycleStatus.Proposed,
    value: GdeLifecycleStatus.Proposed,
    isSelected: false
  },
  {
    label: GdeLifecycleStatus.InUse,
    value: GdeLifecycleStatus.InUse,
    isSelected: false
  },
  {
    label: GdeLifecycleStatus.InUseNonTarget,
    value: GdeLifecycleStatus.InUseNonTarget,
    isSelected: false
  },
  {
    label: GdeLifecycleStatus.InUseTemporarySolution,
    value: GdeLifecycleStatus.InUseTemporarySolution,
    isSelected: false
  },
  {
    label: GdeLifecycleStatus.InUseUnderInvestigation,
    value: GdeLifecycleStatus.InUseUnderInvestigation,
    isSelected: false
  },
  {
    label: GdeLifecycleStatus.ToBeDecommissioned,
    value: GdeLifecycleStatus.ToBeDecommissioned,
    isSelected: false
  },
  {
    label: GdeLifecycleStatus.Decommissioned,
    value: GdeLifecycleStatus.Decommissioned,
    isSelected: false
  },
  {
    label: GdeLifecycleStatus.Cancelled,
    value: GdeLifecycleStatus.Cancelled,
    isSelected: false
  }
]);

const potentiallySensitiveDataElem: Ref<DropdownData[]> = ref([
  {
    label: 'Yes',
    value: 'Yes',
    isSelected: false
  },
  {
    label: 'No',
    value: 'No',
    isSelected: false
  }
]);

const debounceDelay = 500;
const gdeId = ref('');
const gdeName = ref('');
const termId = ref('');

const collectionId = ref('');

const gdeLifecycleStatus = ref('');

const mappedAttributes = ref([] as Attribute[]);

const autosaving = ref(false);

const changesMade = ref(false);

const enableRevert = ref(false);

const linkageReferringId = ref('');

const selectedCheckbox = ref(false);

const isLoading = ref(false);

const validationState = {
  gdeName,
  gdeLifecycleStatus,
  collectionId,
  termId
};

/* -------------------------------------Computed & Watchers---------------------*/

const isDerivedData = computed(() => {
  const isDerivedDataElement = currentGoldenDataElement.value.is_derived_data;
  if (isDerivedDataElement !== null && isDerivedDataElement !== undefined) {
    return isDerivedDataElement ? 'Yes' : 'No';
  }
  return null;
});

const canShowAlexWrapper = computed((): boolean => {
  return !!termId.value && !!collectionId.value;
});

const validations = computed(() => {
  return {
    gdeName: {
      required,
      unique: gdeNameUniqueValidator
    },
    gdeLifecycleStatus: {
      required
    },
    collectionId: {
      required: requiredIf(() => !!termId.value)
    },
    termId: {
      required: requiredIf(() => !!collectionId.value)
    },
    $validationGroups: {
      allFieldsAreValid: [
        'gdeName',
        'gdeLifecycleStatus',
        'collectionId',
        'termId'
      ]
    }
  };
});

const currentGoldenDataElement = computed((): LinkedElement => {
  if (props.gdeInlineEdit) {
    return props.goldenDataElement;
  }
  return GdsSidebarStorage.getActiveGoldenDataElement();
});

const defaultGoldenDataElement = computed((): LinkedElement => {
  return GdsSidebarStorage.getDefaultGoldenDataElement();
});

const isNoReferringFlag = computed((): boolean => {
  return currentGoldenDataElement.value.referring_element_indicator === 'No';
});

const disableSaveAndClose = computed((): boolean => {
  return v$.value.$validationGroups.allFieldsAreValid.$invalid ||
    isLoading.value ||
    autosaving.value
    ? true
    : !changesMade.value;
});

const editRequest = computed(() => {
  return JSON.parse(JSON.stringify(GdsSidebarStorage.getEditRequest()));
});

const enableGDEDataRetention = computed(() =>
  storage.features.hasFeature(ENABLE_GDE_DATA_RETENTION)
);

const onSearch = async (searchKey: string):Promise<void> => {
  if (!searchKey || searchKey.length < 2) {
    suggestionList.value = [];
    return;
  }
   console.log("search key :",searchKey)
  try {
    isSeacrhLoading.value = true;
    // Call your API to search for golden datasets
    const response = GdsSidebarStorage.fetchLinkageRefferingElements(searchKey);
    console.log("response :",response)
    if(response && Array.isArray(response)){
      suggestionList.value = response.map((item: any) => ({
      id: item.data_element_id,
      name: item.data_element_name
    }));
    }    
  } catch (error) {
    console.error('Search failed:', error);
    suggestionList.value = [];
  } finally {
    isSeacrhLoading.value = false;
  }
};

const onSuggestionSelected = (selectedItem: any) => {
  linkageReferringId.value = selectedItem.id.toString();
  updateActiveElement('referring_element_id', linkageReferringId.value);
  autoSave();
};

/** -------------------------------------Functions---------------------*/

async function inlineEditInputChange(value: any, param: string) {
  inlineEditSetActiveGDE();
  await dataElementInputChanged(value, param);
}

function inlineEditSetActiveGDE() {
  const activeGde = GdsSidebarStorage.getActiveGoldenDataElement();
  let sameActiveGde = true;
  const isValidActiveGde =
    'data_element_id' in activeGde && activeGde.data_element_id > 0;

  if (!isValidActiveGde) {
    setActiveGde();
    return;
  }

  sameActiveGde =
    activeGde.data_element_id ===
    currentGoldenDataElement.value.data_element_id;

  if (!sameActiveGde) {
    setActiveGde();
  }
}

function setActiveGde() {
  const targetGoldenDataElement = deepCopy(currentGoldenDataElement.value);

  if (targetGoldenDataElement.change_type !== EDIT_REQUEST_ACTION.ADD) {
    targetGoldenDataElement.change_type = EDIT_REQUEST_ACTION.EDIT;
  }

  gdsEditWorkflowUtil.prepareEditData(targetGoldenDataElement);
}

function isAdded() {
  return currentGoldenDataElement.value.change_type === EDIT_REQUEST_ACTION.ADD;
}

function checkForEditedElement() {
  const currentEditRequest = GdsSidebarStorage.getEditRequest();
  if (currentEditRequest.golden_elements.length !== 0) {
    const editedElementIndex: number =
      currentEditRequest.golden_elements.findIndex(
        (elements: EditLinkageElementAndAttribute) => {
          return (
            elements.data_element_id ===
            currentGoldenDataElement.value.data_element_id
          );
        }
      );
    enableRevert.value = editedElementIndex !== -1;
  }
}

function mapInitialValues() {
  gdeName.value = currentGoldenDataElement.value.data_element_name;
  gdeLifecycleStatus.value = currentGoldenDataElement.value.lifecycle || '';
  linkageReferringId.value =
    currentGoldenDataElement.value.referring_element_id?.toString() || '';

  // Dropdowns
  keyDataElement.value = mapDropdownValues(
    keyDataElement.value,
    currentGoldenDataElement.value.key_element_indicator
  );
  potentiallySensitiveDataElem.value = mapDropdownValues(
    potentiallySensitiveDataElem.value,
    currentGoldenDataElement.value.potential_sensitive_element_indicator
  );

  identifyingDataElement.value = mapDropdownValues(
    identifyingDataElement.value,
    currentGoldenDataElement.value.identifying_element_indicator
  );

  refDataElement.value = mapDropdownValues(
    refDataElement.value,
    currentGoldenDataElement.value.referring_element_indicator
  );

  externalDataElem.value = mapDropdownValues(
    externalDataElem.value,
    currentGoldenDataElement.value.external_element_indicator
  );

  lifeCycleDetails.value = mapDropdownValues(
    lifeCycleDetails.value,
    currentGoldenDataElement.value.lifecycle
  );

  // Other Fields
  mappedAttributes.value =
    currentGoldenDataElement.value.attributes &&
    currentGoldenDataElement.value.attributes.length > 0
      ? currentGoldenDataElement.value.attributes.slice()
      : [];

  gdeId.value =
    currentGoldenDataElement.value.data_element_id?.toString() || '';
  gdeName.value = currentGoldenDataElement.value.data_element_name;
  termId.value = currentGoldenDataElement.value.term_id
    ? currentGoldenDataElement.value.term_id
    : '';
  if (!termId.value) {
    v$.value.termId.$touch();
  }
  collectionId.value = currentGoldenDataElement.value.collection_id
    ? `${currentGoldenDataElement.value.collection_id}`
    : '';
  if (!collectionId.value) {
    v$.value.collectionId.$touch();
  }
}

async function toggleToDropDownMapper(isCheckedVal: boolean, propName: string) {
  inlineEditSetActiveGDE();
  const dropDownMapped =
    GdsSidebarMapper.isCheckedToDropDownMapper(isCheckedVal);
  await dataElementOptionChanged(dropDownMapped, propName);
}

async function inlineDataElementOptionChanged(
  event: DropdownData,
  propName: string
) {
  inlineEditSetActiveGDE();
  await dataElementOptionChanged(event, propName);
}

async function dataElementOptionChanged(event: DropdownData, propName: string) {
  if (propName === 'lifecycle') {
    gdeLifecycleStatus.value = event.value;
    lifeCycleDetails.value = mapDropdownValues(
      lifeCycleDetails.value,
      gdeLifecycleStatus.value
    );
  }
  Utils.debounce(async () => {
    updateActiveElement(propName, event.value);
    const isNoReferringFlagActiveGdeCheck =
      GdsSidebarStorage.getActiveGoldenDataElement()
        .referring_element_indicator === 'No';
    if (
      propName === 'referring_flag' ||
      propName === 'referring_element_indicator'
    ) {
      if (isNoReferringFlagActiveGdeCheck) {
        updateElementWhenNoReferElement();
      } else {
        setPurposeAndLinkedRefToDefault();
      }
    }
    await autoSave();
  }, debounceDelay);
}

function mapDropdownValues(
  selectedArray: DropdownData[],
  propValue: string | undefined
) {
  selectedArray.forEach((option) => {
    option.isSelected = false;
  });
  const elem: DropdownData | undefined = selectedArray.find(
    (option) => option.value === propValue
  );

  if (elem) {
    elem.isSelected = true;
  }
  return selectedArray.slice();
}

async function dataElementInputChanged(value: any, param: string) {
  if (param === inputNames.gdeName) {
    gdeName.value = value;
  }
  if (param === inputNames.linkedReferringId) {
    linkageReferringId.value = value;
  }
  if (param === inputNames.linkedReferringId && value === '') {
    value = null;
  }
  Utils.debounce(async () => {
    updateActiveElement(param, value);
    await autoSave().catch((e) => {
      console.log(e);
    });
  }, debounceDelay);
}

function gdeNameUniqueValidator(value: string) {
  return GdsValidationUtil.checkIfUniqueGdeName(
    value,
    +gdeId.value,
    store().getters[types.DATA_SET],
    GdsSidebarStorage.getEditRequest()
  );
}

/*
  updateElementWhenNoReferElement empties the two linked_referring_element_id and purpose_referring fields
  in the current active data element in the GDSSidbar store when the user sets the referring data element flag
  to 'No'
*/
function updateElementWhenNoReferElement(): void {
  linkageReferringId.value = '';
  const payload: { [key: string]: null } = {
    referring_element_id: null,
    purpose_referring: null
  };
  GdsSidebarStorage.storeEditedValue(payload);
}

/*
  setPurposeAndLinkedRefToDefault rollsback the two linked_referring_element_id and purpose_referring fields
  in the current active data element in the GDSSidbar store when the user sets the referring
  data element flag to 'Yes' (compensating for the emptying of the fields in case of user previously setting
  to 'No')
*/
function setPurposeAndLinkedRefToDefault() {
  const defaultPurposeReferring =
    defaultGoldenDataElement.value.purpose_referring || null;
  linkageReferringId.value =
    defaultGoldenDataElement.value.referring_element_id?.toString() || '';
  const payload: { [key: string]: string | null } = {
    referring_element_id: linkageReferringId.value || null,
    purpose_referring: ['Yes', 'No'].includes(defaultPurposeReferring ?? '')
      ? null
      : defaultPurposeReferring
  };
  GdsSidebarStorage.storeEditedValue(payload);
}

function updateActiveElement(propName: string, value: string | null) {
  const payload = { [propName]: value };
  GdsSidebarStorage.storeEditedValue(payload);
}

async function autoSave() {
  if (v$.value.$validationGroups.allFieldsAreValid.$invalid) {
    return;
  }

  try {
    GdsSidebarMapper.mapDataElementsToWorkflow();
    changesMade.value = true;
    enableRevert.value = true;
    autosaving.value = true;
    await GdsSidebarStorage.saveGoldenDataSet();
    EventBus.$emit('ON_DATA_ELEMENT_CHANGE');
    autosaving.value = false;
  } catch (error) {
    changesMade.value = false;
    enableRevert.value = false;
    autosaving.value = false;
    EventBus.emitActionFeedbackEvent(ENotification.ACTION_FEEDBACK, {
      details: {
        type: ENotificationType.ERROR,
        message: t('gdsSidebar.saveError.element') as string
      }
    });
  }
}

async function onAlexTermsLoaded(termDetails: any) {
  const obj = { termDefinition: termDetails.term.definition };
  GdsSidebarStorage.storeEditedValue(obj);
  GdsSidebarMapper.mapDataElementsToWorkflow();
  EventBus.$emit('ON_DATA_ELEMENT_CHANGE');
}

/* Term & Definition methods */
async function updateAlexComponentInline(
  propertyName: string,
  inputValue: string
) {
  inlineEditSetActiveGDE();
  await updateAlexComponent(propertyName, inputValue);
}

async function updateAlexComponent(propretyName: string, inputValue: string) {
  if (propretyName === 'term_id') {
    termId.value = inputValue;
    v$.value.termId.$touch();
  } else if (propretyName === 'collection_id') {
    collectionId.value = inputValue;
    v$.value.collectionId.$touch();
  }

  Utils.debounce(async () => {
    updateActiveElement(propretyName, inputValue || null);
    await autoSave();
  }, debounceDelay);
}

function checkData() {
  selectedCheckbox.value = !selectedCheckbox.value;
  const emitObj = {
    checkBoxValue: selectedCheckbox.value,
    dataObj: props.goldenDataElement
  };
  emit('checkboxClicked', emitObj);
}

function editLinkage() {
  if (GdsSidebarStorage.isSidebarVisible()) {
    GdsSidebarStorage.closeSidebar();
  }

  setTimeout(() => {
    if (props.gdeInlineEdit) {
      inlineEditSetActiveGDE();
    }
    // show edit linkage sidebar
    GdsSidebarStorage.openSidebarFor(
      GdsSidebarType.dataAttributesInlineVersion
    );
  }, 0);
}

/* Footer action methods */
async function revertChanges() {
  try {
    if (
      editRequest.value.golden_elements &&
      editRequest.value.golden_elements.length !== 0
    ) {
      editRequest.value.golden_elements.splice(
        editRequest.value.golden_elements.findIndex(
          (element: LinkedElement) =>
            element.data_element_id ===
            currentGoldenDataElement.value.data_element_id
        ),
        1
      );
      await GdsSidebarStorage.setEditRequest(
        JSON.parse(JSON.stringify(editRequest.value))
      );
    }
    // 1.reset activeDataElement property in store
    GdsSidebarStorage.resetEditedElement();
    // 2. send http to re-save initial values that changed with auto-save
    autosaving.value = true;
    await GdsSidebarStorage.saveGoldenDataSet();
    EventBus.$emit('ON_DATA_ELEMENT_CHANGE');
    autosaving.value = false;
    trackEditEvent('cancelled');
    // 3. close sidebar
    GdsSidebarStorage.closeSidebar();
  } catch (error) {
    autosaving.value = false;
    EventBus.emitActionFeedbackEvent(ENotification.ACTION_FEEDBACK, {
      details: {
        type: ENotificationType.ERROR,
        message: t('gdsSidebar.saveError.revertChanges') as string
      }
    });
  }
}

async function saveAndClose() {
  try {
    // 1. Save
    autosaving.value = true;
    isLoading.value = true;
    await GdsSidebarStorage.saveGoldenDataSet();
    autosaving.value = false;
    isLoading.value = false;
    trackEditEvent('submitted');
    // 2. Close
    GdsSidebarStorage.closeSidebar();
  } catch (error) {
    autosaving.value = false;
    isLoading.value = false;
    EventBus.emitActionFeedbackEvent(ENotification.ACTION_FEEDBACK, {
      details: {
        type: ENotificationType.ERROR,
        message: t('gdsSidebar.saveError.sidebar') as string
      }
    });
  }
}

function isAttributeLinkageMarkedForDelete(attr: Attribute) {
  return attr.edit_linkage_flag === EDIT_LINKAGE_FLAG.DELETED
    ? 'attribute--deleted'
    : '';
}

function startTrackingEditDataElement(): void {
  analytics.startTrackingEvent(EDataSetEventType.EDIT_DATA_ELEMENT);
}

function trackEditEvent(action: DatasetEditAction) {
  const analyticsProperties: DatasetElementEditAnalyticsProperties = {
    Action: action,
    'Dataset ID': `${currentGoldenDataElement.value?.logs_id}`,
    'Dataset Element ID': `${currentGoldenDataElement.value?.data_element_id}`,
    'Dataset Element Name': currentGoldenDataElement.value?.data_element_name
  };

  analytics.stopTrackingEvent(
    EDataSetEventType.EDIT_DATA_ELEMENT,
    analyticsProperties
  );
}

function isChecked(value: string | null): boolean | null {
  return GdsSidebarMapper.yesNoToIsCheckedMapper(value);
}

/* -------------------------------------LifeCycle hooks & Creation---------------------*/

const v$ = useVuelidate(validations, validationState as any);
GdsSidebarStorage.setActiveMode('Edit');
const linkedElement = GdsSidebarStorage.getActiveGoldenDataElement();
const changeType =
  linkedElement.change_type !== EDIT_REQUEST_ACTION.ADD
    ? EDIT_REQUEST_ACTION.EDIT
    : linkedElement.change_type;
GdsSidebarStorage.storeEditedValue({ change_type: changeType });
mapInitialValues();
checkForEditedElement();
EventBus.$on('onAlexTermsLoaded', onAlexTermsLoaded);
startTrackingEditDataElement();
</script>

<style lang="scss" scoped>
@import '@/datasetView/styles/styles.scss';
$footer_height: 4.4rem;

.text-left {
  text-align: left;
}
.edit-gde-wrapper {
  height: 100%;
}

.edit-gde {
  display: flex;
  flex-direction: column;

  padding: 2rem 1rem;
  max-height: calc(100% - 4.4rem);
  overflow-y: auto;
  overflow-x: hidden;

  :deep() {
    .label-info {
      flex-direction: column;
      align-items: flex-start;
    }
    .label {
      margin-bottom: 0.5rem;
    }
  }

  .last-field {
    margin-bottom: calc(#{$footer_height} * 2);
  }

  .includes-dropdown {
    :deep() {
      .dropdown-container {
        width: 100%;
      }
      .info {
        width: 100%;
      }
      .dropdown-selected-field-text {
        text-align: left;
      }
    }
  }

  .mapped-attibutes {
    position: relative;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid $natural-75;

    &--icon {
      display: none;
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;
    }

    .attr-wrapper {
      text-align: start !important;
    }
    .attr-wrapper.blank-attr {
      text-transform: initial;
      text-align: start !important;
    }
    .attr-wrapper:not(:last-child) {
      margin-bottom: 2px;
    }

    .attribute--deleted {
      color: $abn-negative-500;
      font-style: italic;
      text-decoration: line-through;
    }

    .attr-name {
      @extend .ft-lh-normal;
    }
    .attr-extension {
      @extend .ft-wt-500;
      padding: 2px;
      color: $green-300;
      background-color: $white;
      border: 1px solid $gm-75;
      font-size: 12px;
      line-height: 14px;
      margin-left: 0.5rem;
    }
    &:hover {
      background-color: $g-55;
      cursor: pointer;

      .mapped-attibutes--icon {
        display: block;
      }
      .attr-name {
        color: $green-400;
        text-decoration: underline;
      }
    }
  }

  .includes-field {
    :deep() {
      .info {
        width: 100%;
      }
    }
  }

  .gde-alex {
    background-color: $g-50;
    :deep() {
      .view-terms-and-definitions-wrapper {
        padding: 1rem;
      }
    }
  }
}

.input-warning {
  border-color: $abn-warning;

  :deep() {
    .dropdown-selected-field {
      border-color: $abn-warning;
    }
  }
}

.edit-gde-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  height: $footer_height;
  background-color: $white;
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: $n-65;

  .autosave-wrapper {
    position: relative;

    :deep() {
      .spinner {
        top: 3px;
        left: -40%;
        height: 16px;
        width: 16px;
      }
    }
  }
}

.form-control {
  &.disabled {
    background-color: $n-50;
    transition: none;
    &:hover {
      border-color: #ccc;
    }
  }
}

.disabled {
  pointer-events: none;
  background-color: $n-50;
  :deep() {
    path {
      fill: $n-100;
    }
  }
}

// v-deep issue will be fixed later on by fixing em-popover component
:deep() {
  .popover {
    left: auto;
    right: auto;
    top: 25px;
    max-width: 1000px;
  }
}

.inline-edit-wrapper {
  padding: 1rem;
  border-bottom: 1px solid $natural-55;
  .yellow {
    // background-color: yellow; for debug purposes
  }

  .blue {
    // background-color: lightblue; for debug purposes
  }

  .vertical-align-center {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 20px;
    color: $green-muted-100;
  }
}
:deep() {
  .tooltip-wrapper_text.left {
    right: 40px !important;
    top: 10px !important;
  }
}
.file-attributes {
  position: relative;
  width: 100%;
  padding: 0px;
  &--icon {
    display: none;
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
  }
  &:hover {
    border: 1px solid $natural-75;
    cursor: pointer;
    .file-attributes--icon {
      display: block;
    }
  }
}
</style>
