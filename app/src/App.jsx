import React, { useEffect, Suspense, lazy, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { isMobile } from 'react-device-detect';
//import { hasRole } from 'helpers/authHelpers';
import { CircularLoading } from '@/components/layout/Loading';
//import setupAxiosInterceptors from 'services/setTokenHeader'
import { useStore } from 'services/store';
import Layout from 'pages/Layout';
import { useSurveyData, useMimaData, useExcavationData } from '@/hooks/getData'
import axios from 'axios';
import NewBag from 'components/NewBag';

const Relationships = lazy(() => import ('pages/mima/MimaRelationships'));
const Vocabulary = lazy(() => import ('pages/mima/MimaVocabulary'));
const Media = lazy(() => import ('pages/mima/MimaMedia'));
const Map = lazy(() => import ('pages/mima/MimaMap'));
const About = lazy(() => import ('pages/mima/MimaAbout'));
const Audit = lazy(() => import ('pages/Audit'));
const Settings = lazy(() => import ('pages/Settings'));
const NoPage = lazy(() => import ('pages/NoPage'));

const Overview = lazy(() => import ('pages/mima/MimaOverview'));
const Documentary = lazy(() => import ('pages/mima/MimaDocumentary'));
const Literary = lazy(() => import ('pages/mima/MimaLiterary'));
const Archaeological = lazy(() => import ('pages/mima/MimaArchaeological'));
const Visual = lazy(() => import ('pages/mima/MimaVisual'));
const SurveyMenu = lazy(() => import ('pages/survey/SurveyMenu'));
const SurveyLine = lazy(() => import ('pages/survey/SurveyLine'));
const SurveyTract = lazy(() => import ('pages/survey/SurveyTract'));
const SurveyFeature = lazy(() => import ('pages/survey/SurveyFeature'));
const SurveyPhoto = lazy(() => import ('pages/survey/SurveyPhoto'));
const SurveyScape = lazy(() => import ('pages/survey/SurveyScape'));
const DesktopScape = lazy(() => import ('pages/survey/DesktopScape'));
const SurveyFind = lazy(() => import ('pages/survey/SurveyFind'));
const SurveyGeometry = lazy(() => import ('pages/survey/SurveyGeometry'));
const SurveySelTract = lazy(() => import ('pages/survey/SurveySelTract'));
const SurveySelLine = lazy(() => import ('pages/survey/SurveySelLine'));
const SurveySelFeat = lazy(() => import ('pages/survey/SurveySelFeat'));
const SurveySelScape = lazy(() => import ('pages/survey/SurveySelScape'));
const SurveySelGrid = lazy(() => import ('pages/survey/SurveySelGrid'));
const SurveyGrid = lazy(() => import ('pages/survey/SurveyGrid'));
const SurveySelSample = lazy(() => import ('pages/survey/SurveySelSample'));
const SurveySample = lazy(() => import ('pages/survey/SurveySample'));

const Menu = lazy(() => import ('pages/excavation/Menu'));
const Trench = lazy(() => import ('pages/excavation/Trench'));
const Context = lazy(() => import ('pages/excavation/Context'));
const Bag = lazy(() => import ('pages/excavation/Bag'));
const Find = lazy(() => import ('pages/excavation/Find'));
const Topo = lazy(() => import ('pages/excavation/Topo'));
const FullMap = lazy(() => import ('pages/excavation/Map'));
const Matrix = lazy(() => import ('pages/excavation/Relationships'));
const Notes = lazy(() => import ('pages/excavation/Notes'));
const KerosAbout = lazy(() => import ('pages/excavation/About'));
const KerosMedia = lazy(() => import ('pages/excavation/Media'));
const KerosVocab = lazy(() => import ('pages/excavation/Vocabulary'));


export default function App() {
//  const renderCount = useRef(0);
//  renderCount.current += 1;
//  console.log(`App render count: ${renderCount.current}`);
//  
//  useEffect(() => {
//    console.log('App component mounted');
//    return () => {
//      console.log('App component unmounted');
//    };
//  }, []);
//  
  const { keycloak, initialized } = useKeycloak();
  const modules = useStore.getState().modules;
  const fetchExcavationData = useExcavationData();
  const fetchSurveyData = useSurveyData();
  const fetchMimaData = useMimaData();
  const userRole = useStore(state => state.userRole);
  const setUserRole = useStore(state => state.setUserRole);
  const kcClient = useStore(state => state.env.kcClient);
  const popData = useStore(state => state.popData);

  // Updates the axios interceptors whenever the token changes
//  useEffect(() => {
//    if (keycloak.token) {
//      // When axios makes API calls the token will be sent automatically      
//      setupAxiosInterceptors(keycloak.token);
//      console.log("Authentication bearer set.")
//
//    }
//  }, [keycloak.token]);
//
//  // Check token validity and refresh if necessary before making a request
//  useEffect(() => {
//    if (keycloak.authenticated) {
//      try {
//        keycloak.updateToken(5)
//            .then(refreshed => {
//              if (refreshed) {
//                console.log('Token was successfully refreshed');
//              } else {
//                console.log('Token is still valid');
//              }
//            })      
//      } catch (error) {
//        console.error('Failed to refresh token', error);
//        throw error;
//      }
//    }
//  }, [keycloak.authenticated, keycloak.token]);
//
  if (isMobile) {
    console.log("Mobile detected")
  } else {
    console.log("Desktop detected")
  }

  // Setup the Axios interceptor
  useEffect(() => {
    // Ensure the interceptor is set up only once
    const interceptor = axios.interceptors.request.use(config => {
      if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
      return config;
    }, error => {
      return Promise.reject(error);
    });
    // Eject the interceptor when component unmounts
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []); // Empty dependency array to set it up only on mount

  // Token refresh logic
  useEffect(() => {
    if (keycloak.authenticated) {
      const refreshInterval = setInterval(() => {
        keycloak.updateToken(70) // Set minValidity to a reasonable time, like 70 seconds before it expires
          .then(refreshed => {
            if (refreshed) {
              console.log('Token was successfully refreshed');
            } else {
              console.log('Token is still valid');
            }
          })
          .catch(error => {
            console.error('Failed to refresh token', error);
          });
      }, 60000); // Check every minute as an example

      // Clean up interval on component unmount
      return () => clearInterval(refreshInterval);
    }
  }, [keycloak.authenticated, keycloak.token]);

  useEffect(() => {
    if (keycloak.authenticated && !popData) {
      if (modules.includes("survey")){
        fetchSurveyData();
      }
      if (modules.includes("excavation")){
        fetchExcavationData();
      }
      if (modules.includes("mima")){
        fetchMimaData();
      }
      // get user role from Keycloak
      setUserRole(keycloak.resourceAccess?.[kcClient]?.roles[0])
    }
  }, [keycloak.token, fetchSurveyData, fetchMimaData, fetchExcavationData]);

  // When component mounts
  useEffect(() => {
    // Add class to body
    document.body.className = 'w3-light-grey';
    // When component unmounts
    return () => {
      // Remove class from body
      document.body.className = '';
    }
  }, []);

  if (!initialized) {
    return <CircularLoading/>;
  } else if (keycloak.authenticated && !userRole) {
    return (
      <div> 
        <p>User has no access privileges. If you recently registered, contact hallvard@indgjerd.no to get access. </p>
        <button className="w3-button" type="button" onClick={() => keycloak.logout()}>
         Logout
      </button>
      </div>
    );
  }

  return (
    <>
      {keycloak.authenticated && (
        <BrowserRouter>
          <Suspense fallback={<CircularLoading/>}>
            <Routes>
              <Route path="/" element={<Layout />}>
                {modules.includes("mima") && 
                  <>
                    <Route index element={<Overview />} />
                    <Route path="Documentary" element={<Documentary />}>
                      <Route path=":id" element={<Documentary />} />
                    </Route>
                    <Route path="Literary" element={<Literary />} >
                      <Route path=":id" element={<Literary />} />
                    </Route>
                    <Route path="Archaeological" element={<Archaeological />} >
                      <Route path=":id" element={<Archaeological />} />
                    </Route>
                    <Route path="Visual" element={<Visual />} >
                      <Route path=":id" element={<Visual />} />
                    </Route>
                    <Route path="Vocabulary" element={<Vocabulary />} >
                      <Route path=":type" element={<Vocabulary />}>
                        <Route path=":id" element={<Vocabulary />} />
                      </Route>
                    </Route>
                    <Route path="Relationships" element={<Relationships />} />
                    <Route path="Media" element={<Media />} >
                      <Route path=":id" element={<Media />} />
                    </Route>
                    <Route path="Map" element={<Map />} >
                      <Route path=":id" element={<Map />} />
                    </Route>
                    <Route path="About" element={<About />} />
                  </>
                }
                {modules.includes("excavation") && 
                  <>
                    <Route index element={<Menu />} />
                    <Route path="Context" element={<Context />}>
                      <Route path=":type" element={<Context />} >
                        <Route path=":id" element={<Context />} />
                      </Route>
                    </Route>
                    <Route path="Trench" element={<Trench />} >
                      <Route path=":id" element={<Trench />} />
                    </Route>
                    <Route path="Find" element={<Find />} >
                      <Route path=":id" element={<Find />} />
                    </Route>
                    <Route path="Bag" element={<Bag />}>
                      <Route path="Add" element={<NewBag />} />
                      <Route path=":type" element={<Bag />} >
                        <Route path=":id" element={<Bag />} />
                      </Route>
                    </Route>
                    <Route path="Topo" element={<Topo />} >
                      <Route path=":id" element={<Topo />} />
                    </Route>
                    <Route path="Vocabulary" element={<KerosVocab />} >
                      <Route path=":type" element={<KerosVocab />}>
                        <Route path=":id" element={<KerosVocab />} />
                      </Route>
                    </Route>
                    <Route path="Relationships" element={<Matrix />} />
                    <Route path="Media" element={<KerosMedia />} >
                      <Route path=":id" element={<KerosMedia />} />
                    </Route>
                    <Route path="Map" element={<FullMap />} />
                    <Route path="Notes" element={<Notes />} >
                      <Route path=":id" element={<Notes />} />
                    </Route>
                    <Route path="About" element={<KerosAbout />} />
                  </>
                }
                {modules.includes("survey") && 
                  <>
                    <Route path="/" element={<SurveyMenu />} />
                    <Route path="surv_tract" element={<SurveyTract />} >  
                      <Route path="select" element={<SurveySelTract />} />
                      <Route path="photo" element={<SurveyPhoto parent={'tract'} />} />
                    </Route>
                    <Route path="surv_line" element={<SurveyLine />} >
                      <Route path="select" element={<SurveySelLine />} />
                      <Route path="find" element={<SurveyFind parent={'line'} />} >
                        <Route path="photo" element={<SurveyPhoto parent={'find'} />} />
                      </Route>
                    </Route>
                    <Route 
                      path="surv_scape" 
                      element={ 
                        isMobile ? 
                        <SurveyScape /> :
                        <DesktopScape />
                      } 
                    >
                      <Route path="select" element={<SurveySelScape />} />                               
                      <Route path="geom" element={<SurveyGeometry parent={'scape'} />} />
                      <Route path="photo" element={<SurveyPhoto parent={'scape'} />} />
                    </Route>
                    <Route path="surv_feature" element={<SurveyFeature />} >
                      <Route path="select" element={<SurveySelFeat />} />  
                      <Route path="geom" element={<SurveyGeometry parent={'feature'} />} />
                      <Route path="photo" element={<SurveyPhoto parent={'feature'} />} />
                    </Route>
                    <Route path="surv_grid" element={<SurveyGrid />} >
                      <Route path="select" element={<SurveySelGrid />} />                               
                      <Route path="geom" element={<SurveyGeometry parent={'grid'} />} />   
                      <Route path="photo" element={<SurveyPhoto parent={'grid'} />} />                                 
                      <Route path="find" element={<SurveyFind parent={'grid'} />} >
                        <Route path="photo" element={<SurveyPhoto parent={'find'} />} />
                      </Route>
                    </Route>
                    <Route path="surv_sample" element={<SurveySample />} >
                      <Route path="select" element={<SurveySelSample />} />  
                    </Route>
                    <Route path="surv_map" element={<SurveyGeometry />} />
                    <Route path="surv_find" element={<SurveyFind />} >
                      <Route path="photo" element={<SurveyPhoto parent={'find'} />} />
                    </Route>
                  </>
                }
                <Route path="Audit" element={<Audit />} >
                  <Route path=":id" element={<Audit />} />
                </Route>
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NoPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
    </>
  );
};
