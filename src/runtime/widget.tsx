import React, { Component } from 'react';
import { loadArcGISJSAPIModules, JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import { AllWidgetProps } from 'jimu-core';
import FirstSquare from './FirstSquare';
import SecondSquare from './SecondSquare';
import ThirdSquare from './ThirdSquare';
import './Widget.css';
import { CalciteNavigation, CalciteNavigationLogo, CalciteMenuItem, CalciteMenu, CalciteModal, CalciteFab } from 'calcite-components';
import choiceData from './choice.json';


interface IState {
  featureServiceUrlInput: string;
  selectedLayerUrl: string;
  nameLabel: string;
  selectedLayerType: string;
  jimuMapView: JimuMapView;
  storedUrls: { name: string; label: string; url: string; bidang: string; subbidang: string; type: string }[];
  storedUrls2: { name: string; label: string; url: string; bidang: string; subbidang: string; type: string }[];
  addedLayers: __esri.Layer[];
  bidangOptions: string[];
  subbidangOptions: { [bidang: string]: string[] };
  selectedBidang: string;
  selectedSubbidang: string;
  activeTab: 'First' | 'Second' | 'Third';
}

class Widget extends Component<AllWidgetProps<any>, IState> {
  FeatureLayer: typeof __esri.FeatureLayer;
  GeoJSONLayer: typeof __esri.GeoJSONLayer;
  CSVLayer: typeof __esri.CSVLayer;
  SpatialReference: typeof __esri.SpatialReference;

  state: IState = {
    featureServiceUrlInput: '',
    selectedLayerUrl: '',
    nameLabel: '',
    selectedLayerType: '',
    jimuMapView: null,
    storedUrls: [],
    storedUrls2: [],
    addedLayers: [],
    bidangOptions: [],
    subbidangOptions: {},
    selectedBidang: '',
    selectedSubbidang: '',
    activeTab: 'First'
  };

  componentDidMount() {
    this.setState(() => {
      this.fetchStoredUrls();
      this.fetchChoice();
    });
  }

  fetchChoice = () => {
    this.setState({
      bidangOptions: choiceData.bidangOptions,
      subbidangOptions: choiceData.subbidangOptions
    });
  };

  fetchStoredUrls = async () => {
    try {
      const [FeatureLayer] = await loadArcGISJSAPIModules(['esri/layers/FeatureLayer']);
      const featureLayer = new FeatureLayer({
        url: 'https://services-ap1.arcgis.com/oEeR3d3YUukE0FsE/ArcGIS/rest/services/storedUrls/FeatureServer'
      });

      const query = featureLayer.createQuery();
      query.where = '1=1';
      const results = await featureLayer.queryFeatures(query);

      const storedUrls2 = results.features.map(feature => ({
        name: feature.attributes.name,
        label: feature.attributes.label,
        url: feature.attributes.url,
        bidang: feature.attributes.bidang,
        subbidang: feature.attributes.subbidang,
        type: feature.attributes.type
      }));

      this.setState({ storedUrls2 });

      // Add layers to the map
      storedUrls2.forEach(layer => {
        this.addLayer(layer.url, layer.name, layer.type, layer.bidang, layer.subbidang, layer.label);
      });
    } catch (error) {
      console.error('Error fetching stored URLs:', error);
    }
  };

  activeViewChangeHandler = (jimuMapView: JimuMapView) => {
    this.setState({ jimuMapView });
  };

  handleFeatureServiceUrlInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ featureServiceUrlInput: event.target.value });
  };

  handleNameLabelInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nameLabel: event.target.value });
  };

  handleLayerTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedLayerType: event.target.value });
  };

  handleBidangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBidang = event.target.value;
    this.setState({ selectedBidang, selectedSubbidang: '' });
  };

  handleSubbidangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedSubbidang: event.target.value });
  };

  addLayer = (url: string, name: string, layerType: string, bidang: string, subbidang: string, label: string) => {
    const { jimuMapView, storedUrls } = this.state;

    if (!jimuMapView) {
      console.error('Please configure a Data Source with the widget.');
      return;
    }

    if (url === '') {
      alert('Please copy/paste in a FeatureService URL');
      return;
    }

    const layerExists = storedUrls.some(layer => layer.url === url);
    if (layerExists) {
      console.log('Layer with this URL already exists:', url);
      return;
    }

    let layer: __esri.Layer;

    const updateStateAfterLayerAddition = (layer: __esri.Layer) => {
      this.setState((prevState) => ({
        addedLayers: [...prevState.addedLayers, layer],
        storedUrls: [
          ...prevState.storedUrls,
          { name, label, url, bidang, subbidang, type: layerType }
        ],
        featureServiceUrlInput: '',
        selectedLayerUrl: url,
        nameLabel: '',
        selectedLayerType: '',
        selectedBidang: '',
        selectedSubbidang: ''
      }));

      if (this.props.config.zoomToLayer) {
        const query = layer.createQuery();
        query.where = '1=1';
        query.outSpatialReference = new this.SpatialReference({ wkid: 102100 });
        layer.queryExtent(query).then((results) => {
          jimuMapView.view.extent = results.extent;
        });
      }
    };

    if (layerType === 'CSVLayer') {
      loadArcGISJSAPIModules(['esri/layers/CSVLayer', 'esri/geometry/SpatialReference']).then(
        (modules) => {
          [this.CSVLayer, this.SpatialReference] = modules;

          layer = new this.CSVLayer({ url });

          jimuMapView.view.map.add(layer);

          layer.on('layerview-create', () => {
            updateStateAfterLayerAddition(layer);
          });

          layer.on('layerview-create-error', (error) => {
            console.error('Error creating layerview:', error);
          });
        }
      );
    } else if (layerType === 'FeatureLayer') {
      loadArcGISJSAPIModules(['esri/layers/FeatureLayer', 'esri/geometry/SpatialReference']).then(
        (modules) => {
          [this.FeatureLayer, this.SpatialReference] = modules;

          layer = new this.FeatureLayer({ url });

          jimuMapView.view.map.add(layer);

          layer.on('layerview-create', () => {
            updateStateAfterLayerAddition(layer);
          });

          layer.on('layerview-create-error', (error) => {
            console.error('Error creating layerview:', error);
          });
        }
      );
    } else if (layerType === 'GeoJSONLayer') {
      loadArcGISJSAPIModules(['esri/layers/GeoJSONLayer', 'esri/geometry/SpatialReference']).then(
        (modules) => {
          [this.GeoJSONLayer, this.SpatialReference] = modules;

          layer = new this.GeoJSONLayer({ url });

          jimuMapView.view.map.add(layer);

          layer.on('layerview-create', () => {
            updateStateAfterLayerAddition(layer);
          });

          layer.on('layerview-create-error', (error) => {
            console.error('Error creating layerview:', error);
          });
        }
      );
    }
  };

  handleStoredUrlChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUrl = event.target.value;
    const { addedLayers } = this.state;

    console.log("Selected URL:", selectedUrl);
    console.log("Added Layers:", addedLayers);

    // Loop through addedLayers and toggle visibility based on URL
    const updatedLayers = addedLayers.map((layer) => {
      if (layer.url === selectedUrl) {
        console.log("Setting layer visible:", layer.url);
        layer.visible = true; // Show selected layer
      } else {
        console.log("Setting layer invisible:", layer.url);
        layer.visible = false; // Hide other layers
      }
      return layer;
    });

    // Update the state with the modified layers
    this.setState({ addedLayers: updatedLayers });
  };

  formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { featureServiceUrlInput, nameLabel, selectedLayerType, selectedBidang, selectedSubbidang } = this.state;
    const label = `${selectedBidang} - ${selectedSubbidang}`;

    this.addLayer(featureServiceUrlInput, nameLabel, selectedLayerType, selectedBidang, selectedSubbidang, label);

    // Prepare data to send to the FeatureLayer
    const newLayerData = [{
      attributes: {
        name: nameLabel,
        label: label,
        url: featureServiceUrlInput,
        bidang: selectedBidang,
        subbidang: selectedSubbidang,
        type: selectedLayerType
      }
    }];

    try {
      const [FeatureLayer] = await loadArcGISJSAPIModules(['esri/layers/FeatureLayer']);
      const featureLayer = new FeatureLayer({
        url: 'https://services-ap1.arcgis.com/oEeR3d3YUukE0FsE/ArcGIS/rest/services/storedUrls/FeatureServer'
      });

      const editResult = await featureLayer.applyEdits({
        addFeatures: newLayerData
      });

      console.log('Edit result:', editResult);
    } catch (error) {
      console.error('Error updating FeatureLayer:', error);
    }
  };

  handleTabChange = (tab: 'First' | 'Second' | 'Third') => {
    this.setState({ activeTab: tab });
  };

  render() {
    const {
      featureServiceUrlInput,
      nameLabel,
      selectedLayerType,
      storedUrls,
      bidangOptions,
      subbidangOptions,
      selectedBidang,
      selectedSubbidang,
      activeTab,
    } = this.state;

    const button = document.getElementById("button");
    const modal = document.getElementById("modal");

    button?.addEventListener("click", function () {
      modal.open = true;
    });

    return (
      <div>
        {this.props.hasOwnProperty('useMapWidgetIds') &&
          this.props.useMapWidgetIds &&
          this.props.useMapWidgetIds.length === 1 && (
            <JimuMapViewComponent
              useMapWidgetId={this.props.useMapWidgetIds?.[0]}
              onActiveViewChange={this.activeViewChangeHandler}
            />
          )}
        <CalciteModal id="modal">
          <div slot="content">
            <CalciteNavigation slot="header">
              <CalciteNavigationLogo
                slot="logo"
                heading="Add Layer"
                description="Custom Widget"
              ></CalciteNavigationLogo>
              <CalciteMenu slot="content-end">
                <CalciteMenuItem
                  text="Add Layer"
                  icon-start="plus"
                  text-enabled
                  className={activeTab === 'First' ? 'active' : ''}
                  onClick={() => this.handleTabChange('First')}
                ></CalciteMenuItem>
                <CalciteMenuItem
                  text="Stored Urls"
                  icon-start="storage"
                  text-enabled
                  className={activeTab === 'Second' ? 'active' : ''}
                  onClick={() => this.handleTabChange('Second')}
                ></CalciteMenuItem>
                <CalciteMenuItem
                  text="Filter Urls"
                  icon-start="filter"
                  text-enabled
                  className={activeTab === 'Third' ? 'active' : ''}
                  onClick={() => this.handleTabChange('Third')}
                ></CalciteMenuItem>
              </CalciteMenu>
            </CalciteNavigation>
            <div className="tab-content">
              {activeTab === 'Second' && (
                <FirstSquare
                  storedUrls={storedUrls}
                  onhandleStoredUrlChange={this.handleStoredUrlChange}
                />
              )}
              {activeTab === 'First' && (
                <SecondSquare
                  featureServiceUrlInput={featureServiceUrlInput}
                  nameLabel={nameLabel}
                  selectedLayerType={selectedLayerType}
                  bidangOptions={bidangOptions}
                  subbidangOptions={subbidangOptions}
                  selectedBidang={selectedBidang}
                  selectedSubbidang={selectedSubbidang}
                  onFeatureServiceUrlInputChange={this.handleFeatureServiceUrlInputChange}
                  onNameLabelInput={this.handleNameLabelInput}
                  onLayerTypeChange={this.handleLayerTypeChange}
                  onBidangChange={this.handleBidangChange}
                  onSubbidangChange={this.handleSubbidangChange}
                  onSubmit={this.formSubmit}
                />
              )}
              {activeTab === 'Third' && (
                <ThirdSquare
                  storedUrls={storedUrls}
                  bidangOptions={bidangOptions}
                  subbidangOptions={subbidangOptions}
                  selectedBidang={selectedBidang}
                  selectedSubbidang={selectedSubbidang}
                  onBidangChange={this.handleBidangChange}
                  onSubbidangChange={this.handleSubbidangChange}
                />
              )}
            </div>
          </div>
        </CalciteModal>
        <div className="button-container">
          <CalciteFab id="button" label="Add Layer">Open modal</CalciteFab>
        </div>

      </div>
    );
  }
}

export default Widget;