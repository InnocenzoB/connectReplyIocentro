import { NavigationActions, NavigationRouteConfigMap } from "react-navigation";

import { Overview } from "../components/steps_screen/Overview";
import { PlatformSelect } from "../Platform";
import { Creation } from "../views/Creation";
import { GlobalNotes } from "../views/GlobalNotes";
import { RecipeSummaryScreen } from "../views/RecipeSummaryScreen";
import { StepsScreen } from "../views/StepsScreen";
import { SearchScreenWrapper } from "./SearchScreenWrapper";

type RouteDescriptor = { routeName: string } | string; // routeName or {routeName}

function IsSameRoute(descriptor: RouteDescriptor, routeName: string): boolean {
  if (typeof descriptor == "string") {
    return descriptor == routeName;
  }
  return descriptor.routeName == routeName;
}

/**
 * Scans navigationState for routes from routesToFind.
 *
 * Function could be used for example when there is a need to know
 * if the application is in some screen of TabNavigator. In such case:
 *
 * Home: TabNavigator {
 *  Screen1,
 *  Screen2, <- current screen
 * }
 *
 * getCurrentRouteName() would return "Screen2", and there will be no way
 * to tell that we are in Home.
 *
 * Originally created to highlight tabs in QuickChoiceBottomBar.
 *
 * @param routesToFind Array of items describing which routes should be found
 *
 * @returns RouteName that was found inside navigationState
 *          or null if none of routes were found.
 */
export function scanCurrentRoute(navigationState, routesToFind: RouteDescriptor[]): string | null {
  if (!navigationState) {
    return null;
  }
  if (!navigationState.routes) {
    if (routesToFind.some((el) => IsSameRoute(el, navigationState.routeName))) {
      return navigationState.routeName;
    }
    return null;
  }
  const route = navigationState.routes[navigationState.index];

  if (routesToFind.some((el) => IsSameRoute(el, route.routeName))) {
    return route.routeName;
  }
  if (route.routes) {
    return scanCurrentRoute(route, routesToFind);
  }

  return null;
}

export function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  if (!navigationState.routes) {
    return navigationState.routeName;
  }
  const route = navigationState.routes[navigationState.index];

  if (route.routes) {
    return getCurrentRouteName(route);
  }

  return route.routeName;
}

/**
 * Scans navigation history to get the data connected to the
 * route with routeName.
 *
 * If the routeName was found preceedingRoute is also returned
 * so that it can be used as a goBack function argument.
 * Note that preceedingRoute may be undefined.
 *
 * Inspiration: https://github.com/react-navigation/react-navigation/issues/697#issuecomment-348252969
 *
 * @returns { foundRoute, preceedingRoute } if the route was found.
 *          null if the route was not found.
 */
export function scanNavigationHistory(navigationState, routeName): {
  foundRoute: any;
  preceedingRoute: any;
} | null {
  if (!navigationState.routes) {
    if (navigationState.routeName == routeName) {
      return { foundRoute: navigationState, preceedingRoute: undefined };
    }
    return null;
  }
  // reverse the routes so we go back to the most recent route with name==RouteName
  const reversedRoutes = navigationState.routes.slice().reverse();

  const index = reversedRoutes.findIndex((r) => {
    return (
      // Check if the route is the one we want
      r.routeName === routeName ||
      // Or if this is a nested Navigator route, recursively check to see if
      // its children match
      !!(r.routes && scanNavigationHistory(r, routeName))
    );
  });

  // If we didn't find the route, then return immediately
  if (index === -1) { return null; }

  // We want the key of the route _after_ routeName so that when we go back from
  // key, we are at routeName
  // Since we have reversed the routes, later routes have smaller indices
  const preceedingRoute = reversedRoutes[index - 1];
  const foundRoute = reversedRoutes[index];

  return { preceedingRoute, foundRoute };
}

/**
 * Goes back to the routeName if is exist inside navigation history,
 * if not, navigates to it.
 *
 * Does nothing if the currentRouteName equals to the routeName.
 *
 * @returns true if navigation was performed.
 */
export function goBackTo(routeName, navigation): boolean {
  const currentRouteName = getCurrentRouteName(navigation.state);
  if (currentRouteName == routeName) {
    return false;
  }

  const historyRoutes = scanNavigationHistory(navigation.state, routeName);
  if (!historyRoutes) {
    navigation.navigate(routeName);
    return true;
  }

  let didNavigate = false;
  const { foundRoute, preceedingRoute } = historyRoutes;

  if (preceedingRoute) {
    // (db): leaving this as a comment, since it sometimes behaves different than simple "goBack" func
    // navigation.dispatch(NavigationActions.back({ key: preceedingRoute.key }));
    navigation.goBack(preceedingRoute.key);
    didNavigate = true;
  }
  const { index, routes } = foundRoute;
  if (routes) {
    // maybe getCurrentRouteName should be used?
    const currentRouteInFoundRoute = routes[index];
    if (currentRouteInFoundRoute.routeName != routeName) {
      navigation.navigate(routeName);
      didNavigate = true;
    }
  }

  return didNavigate;
}

/**
 * Resets navigation to routeName.
 */
export function resetTo(routeName, navigation) {
  const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({ routeName }),
    ],
  });
  navigation.dispatch(resetAction);
}

export function LogCurrentNavPath(navState, depth = 0) {
  if (!__DEV__) { return; }
  const { index, routes } = navState;

  if (routes) {
    const innerRoute = routes[index];
    LogCurrentNavPath(innerRoute, depth + 1);
  }
  // tslint:disable-next-line:no-console
  console.log(["LogCurrentNavPath", depth], navState, navState.key, navState.routeName);
}

export function LogNavStateCopy(navState) {
  if (!__DEV__) { return; }
  const cache: Set<any> = new Set();
  const str = JSON.stringify(navState, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (key == "params") {
        return "<SKIPPED>";
      }
      if (cache.has(value)) {
        // Circular reference found, discard key
        return "<DUPLICATED>";
      }
      // Store value in our collection
      cache.add(value);
    }
    return value;
  });
  // tslint:disable-next-line:no-console
  console.log(["LogNavStateCopy"], JSON.parse(str), { str });
}

export const commonSignedInNavRoutes: NavigationRouteConfigMap = {
  RecipeSummary: { screen: RecipeSummaryScreen },
  Creation: { screen: Creation },
  GlobalNotes: { screen: GlobalNotes },
  Steps: { screen: StepsScreen },
  ...PlatformSelect({
    anyTablet: {
      ViewAll: { screen: SearchScreenWrapper },
      Overview: { screen: Overview },
      Search: { screen: SearchScreenWrapper },
    },
  }),
};

let _topNavigator;
export function RegisterTopNavigator(navigatorRef) {
  _topNavigator = navigatorRef;
}
export function TopNavigate(routeName, params?) {
  _topNavigator.dispatch(
    NavigationActions.navigate({
      // type: NavigationActions.NAVIGATE,
      routeName,
      params,
    }),
  );
}
