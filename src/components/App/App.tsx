import React from 'react';
import { AppRootProps } from '@grafana/data';
import { PluginPropsContext } from '../../utils/utils.plugin';
import { Route, Routes } from 'react-router-dom';
import {
  CustomVariable,
  RefreshPicker,
  SceneContextProvider,
  useQueryRunner,
  VariableControl,
  VizPanel,
} from '@grafana/scenes-react';
import { PluginPage } from '@grafana/runtime';
import { Stack } from '@grafana/ui';
import {
  EmbeddedScene,
  PanelBuilders,
  SceneApp,
  SceneAppPage,
  SceneFlexItem,
  SceneFlexLayout,
  SceneTimeRange,
  SceneVariableSet,
  useSceneApp,
  VizConfigBuilders,
  CustomVariable as SceneCustomVariable,
  VariableValueControl,
  SceneQueryRunner,
} from '@grafana/scenes';

function Table() {
  const panel = VizConfigBuilders.table().build();

  const data = useQueryRunner({
    datasource: {
      type: 'grafana-clickhouse-datasource',
      uid: 'P1CEE5E10C8D5F211'
    },
    queries: [
      {
        refId: 'Table',
        rawSql: `select $__conditionalAll('web' in [\${tx_type:singlequote}], $tx_type)`,
      },
    ],
    maxDataPoints: 100,
  });

  return (
    <VizPanel
      title='Transactions'
      viz={panel}
      dataProvider={data}
    />
  );
}

function PageContent() {
  return (
    <Stack direction='column'>
      <Stack>
        <VariableControl name='tx_type'/>
      </Stack>
      <Stack height='400px'>
        <Table/>
      </Stack>
    </Stack>
  );
}

function Page() {
  const pageNav = { text: 'scenes-react' };
  return (
    <PluginPage
      pageNav={pageNav}
      actions={<RefreshPicker/>}>
      <CustomVariable
        name='tx_type'
        query='web,other'
        includeAll
      >
        <PageContent/>
      </CustomVariable>
    </PluginPage>
  );
}

function getSceneApp() {
  function getScene() {
    return new EmbeddedScene({
      $timeRange: new SceneTimeRange(),
      $variables: new SceneVariableSet({
        variables: [
          new SceneCustomVariable({
            name: 'tx_type',
            query: 'web,other',
            includeAll: true,
          }),
        ],
      }),
      controls: [
        new VariableValueControl({variableName: 'tx_type'}),
      ],
      $data: new SceneQueryRunner({
        datasource: {
          type: 'grafana-clickhouse-datasource',
          uid: 'P1CEE5E10C8D5F211'
        },
        queries: [
          {
            refId: 'Table',
            rawSql: `select $__conditionalAll('web' in [\${tx_type:singlequote}], $tx_type)`,
          },
        ],
        maxDataPoints: 100,
      }),
      body: new SceneFlexLayout({
        direction: 'column',
        children: [
          new SceneFlexItem({
            height: 400,
            body: PanelBuilders.table()
              .build(),
          }),
        ],
      }),
    });
  }

  return new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'scenes',
        url: '/',
        routePath: '',
        getScene,
      })
    ]
  });
}

function AppRoutes() {
  const scene = useSceneApp(getSceneApp)
  return (
    <Routes>
      <Route path='/scenes-react' Component={Page}></Route>
      <Route path='/scenes' element={<scene.Component model={scene}/>}></Route>
    </Routes>
  );
}

function App(props: AppRootProps) {
  return (
    <PluginPropsContext.Provider value={props}>
      <SceneContextProvider
        timeRange={{ from: 'now-24h', to: 'now' }}
        withQueryController
      >
        <AppRoutes/>
      </SceneContextProvider>
    </PluginPropsContext.Provider>
  );
}

export default App;
