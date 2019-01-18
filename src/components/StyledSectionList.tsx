import React, { Component } from "react";
import { StyleProp, View, ViewProperties, ViewStyle } from "react-native";

export interface StyledSection {
  items: any[];
  title?: string;
  data?: any;
}

interface StyledSectionListProps extends ViewProperties {
  renderSectionHeader?: (section: StyledSection, index: number) => React.ReactElement<any> | null;
  renderSectionFooter?: (section: StyledSection, index: number) => React.ReactElement<any> | null;
  renderItem?: (item: any, index: number, section: StyledSection) => React.ReactElement<any> | null;
  itemKeyExtractor?: (item: any, index: number) => string;
  sectionKeyExtractor?: (section: StyledSection, index: number) => string;
  sectionStyle?: StyleProp<ViewStyle>;
  sections: StyledSection[];
  itemSpacing?: number;
  sectionSpacing?: number;
  itemsFlexDirection?: "row" | "column";
}

export class StyledSectionList extends Component<StyledSectionListProps> {
  public static defaultProps: StyledSectionListProps = {
    sections: [],
    itemSpacing: 0,
    sectionSpacing: 0,
    itemsFlexDirection: "column",
    itemKeyExtractor: (_item, index) => index.toString(),
    sectionKeyExtractor: (_section, index) => index.toString(),
  };

  public render() {
    return (
      <View {...this.props}>
        {this._renderSections()}
      </View>
    );
  }

  private _renderSections() {
    const { renderSectionHeader, renderSectionFooter, sectionKeyExtractor } = this.props;
    let sectionSpacing = this.props.sectionSpacing;

    const renderedSections = this.props.sections.map((section, index, sections) => {
      const sectionHeader = renderSectionHeader && renderSectionHeader(section, index);
      const sectionFooter = renderSectionFooter && renderSectionFooter(section, index);
      if (index == sections.length - 1) {
        sectionSpacing = 0;
      }
      return (
        <View style={{ marginBottom: sectionSpacing }} key={sectionKeyExtractor && sectionKeyExtractor(section, index)}>
          <View style={this.props.sectionStyle}>
            {sectionHeader}
            {this._renderSectionItems(section)}
            {sectionFooter}
          </View>
        </View>
      );
    });

    return renderedSections;
  }

  private _renderSectionItems(section) {
    const { renderItem, itemKeyExtractor, itemsFlexDirection } = this.props;
    let itemSpacing = this.props.itemSpacing;
    const spacingStyleProperty = (() => {
      if (itemsFlexDirection && itemsFlexDirection.startsWith("row")) {
        return "width";
      } else {
        return "height";
      }
    })();

    const renderedItems = section.items.map((item, index, items) => {
      if (index == items.length - 1) {
        itemSpacing = 0;
      }
      return (
        <View
          style={{ flexDirection: itemsFlexDirection }}
          key={itemKeyExtractor && itemKeyExtractor(item, index)}
        >
          {renderItem && renderItem(item, index, section)}
          {itemSpacing ? (
            <View style={{ [spacingStyleProperty]: itemSpacing }}></View>
          ) : null}
        </View>
      );
    });

    return (
      <View style={{
        flexDirection: itemsFlexDirection,
        justifyContent: "center",
      }}>
        {renderedItems}
      </View>
    );
  }
}
