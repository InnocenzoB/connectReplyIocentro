import React from "react";
import { Image } from "react-native";
import { Subscription } from "rxjs";

import { ImageModel } from "iocentro-collection-manager";
import { ioCentroDispatch, ioCentroEndpoint, ioCentroEndpointParam, ioCentroEndpointType } from "iocentro-connectivity";

interface ImageFromModelState {
  uri?: string;
}

interface ImageFromModelProps {
  width: number;
  height: number;
  image: ImageModel;
}

export class ImageFromModel extends React.Component<ImageFromModelProps, ImageFromModelState> {
  constructor(props) {
    super(props);

    this.state = {
      uri: undefined,
    };
  }

  public componentWillMount() {
    this._modelChanged = this.props.image.modelChanged
      .subscribe(this._update.bind(this));
    this._update(this.props.image);
  }

  public componentWillUnmount() {
    this._modelChanged.unsubscribe();
  }

  public componentWillReceiveProps(nextProps: ImageFromModelProps) {
    this._update(nextProps.image);
  }

  public render() {
    const { width, height } = this.props;
    const { uri } = this.state;
    if (uri === undefined) { return null; }
    return (
      <Image
        resizeMode={"contain"}
        style={{
          width,
          height,
        }}
        source={{uri}}
      />
    );
  }

  private _update(image: ImageModel) {
    let uri: string | undefined;
    const imgDesc = image.default();
    if (imgDesc) {
      const param = new ioCentroEndpointParam(ioCentroEndpointType.getAsset);
      param.setValue(imgDesc.link);
      uri = ioCentroDispatch.uriGen((
        new ioCentroEndpoint(param)).getUri());
    }
    this.setState({
      uri,
    });
  }

  private _modelChanged: Subscription;
}
