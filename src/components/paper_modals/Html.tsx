import React, { Component } from "react";
import { WebView, WebViewProperties } from "react-native";
import { ModalProps } from "react-native-modal";

import { IS_TABLET } from "../../Platform";
import { FontScalingStrategy } from "../ScaledText";
import { PaperModalCommonData, PaperModalStateless } from "./Base";

export interface HtmlModalData extends PaperModalCommonData {
  content: string;
}

export interface HtmlModalState extends HtmlModalData {
  visible: boolean;
}

export interface HtmlModalProps extends Partial<ModalProps> {
  css?: string;
  webViewProps?: WebViewProperties;
}

export class HtmlModal extends Component<HtmlModalProps, HtmlModalState> {
  public state: HtmlModalState = {
    content: "",
    visible: false,
  };

  public render() {
    const {
      style,
      css,
      children,
      webViewProps,
      ...modalProps,
    } = this.props;
    const {
      title1,
      title2,
      content,
      visible,
    } = this.state;
    return (
      <PaperModalStateless
        {...modalProps}
        isVisible={visible}
        onHideRequest={this.hide}
        style={[{
          flex: 1,
          justifyContent: "center",
          margin: IS_TABLET ? 30 : 20,
        }, style]}
        paperStyle={{ padding: IS_TABLET ? 20 : 10 }}
        title1={title1}
        title2={title2}
      >
        {HtmlModal.WebContent(content, css, webViewProps)}
      </PaperModalStateless>
    );
  }

  public static WebContent(content: string, css?: string, webViewProps?: WebViewProperties) {
    return (
      <WebView
        style={{ flex: 1, backgroundColor: "transparent" }}
        scalesPageToFit={false}
        source={{
          html:
            `<html>
              <head>
                <style type="text/css">
                  @font-face {
                    font-family: Merriweather;
                    src: url("file:///assets/fonts/Merriweather.ttf") format("opentype");
                  }
                  html, body {
                    font-family: Merriweather;
                    font-size: ${FontScalingStrategy.ScaleDownIfNeeded(14)}px;
                  }
                  body {
                    background-color: transparent;
                  }
                  h1, h2, h3, h4, h5, p {
                    color: black;
                  }
                  ${css}
                </style>
              </head>
              <body>
                ${content.replace(/\n/g, "<br>")}
              </body>
            </html>`,
        }}
        {...webViewProps}
      />
    );
  }

  public readonly show = (data: HtmlModalData) => {
    if (this.state.visible) {
      this.setState({ visible: false }, () => this.show(data));
      return;
    }
    this.setState({ ...data, visible: true });
  }

  public readonly hide = () => {
    this.setState({ visible: false });
  }
}
