import React from 'react';
import { AppRootProps } from '@grafana/data';
import { PluginPropsContext } from '../../utils/utils.plugin';
import { Route, Routes } from 'react-router-dom';
import {
  CustomVariable,
  QueryVariable,
  RefreshPicker,
  SceneContextProvider,
  useQueryRunner,
  VariableControl,
  VizPanel,
} from '@grafana/scenes-react';
import { PluginPage } from '@grafana/runtime';
import { Stack } from '@grafana/ui';
import { VizConfigBuilders } from '@grafana/scenes';

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
        rawSql: 'select $__conditionalAll(${scope:singlequote}, $scope)',
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

function Page() {
  const pageNav = { text: 'Home' };
  return (
    <PluginPage
      pageNav={pageNav}
      actions={<RefreshPicker/>}>
      <CustomVariable
        name='tx_type'
        query='web,other'
        includeAll
        initialValue='$__all'
      >
        <QueryVariable
          name={'scope'}
          datasource={{
            type: 'grafana-clickhouse-datasource',
            uid: 'P1CEE5E10C8D5F211'
          }}
          query={{
            refId: 'Scope',
            rawSql: `select $__conditionalAll(arrayJoin(['one', 'two', 'three']), $tx_type)`,
          }}
          initialValue='$__all'
          isMulti
          includeAll
        >
          <Stack direction='column'>
            <Stack>
              <VariableControl name='tx_type'/>
              <VariableControl name='scope'/>
            </Stack>
            <Stack height='400px'>
              <Table/>
            </Stack>
          </Stack>
        </QueryVariable>
      </CustomVariable>
    </PluginPage>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' Component={Page}></Route>
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
