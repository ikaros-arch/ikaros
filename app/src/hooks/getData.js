import { useStore } from 'services/store';
import { makeRequest } from 'services/query';
import { useKeycloak } from '@react-keycloak/web';

export const useExcavationData = () => {
  const { keycloak } = useKeycloak();

  const setPopData = useStore(state => state.setPopData);
  const setActiveActor = useStore(state => state.setActiveActor);
  const setActors = useStore(state => state.setActors);
  const setTerms = useStore(state => state.setTerms);
  const setTermTypes = useStore(state => state.setTermTypes);
  const setContexts = useStore(state => state.setContexts);
  const setProjects = useStore(state => state.setProjects);
  const setAreas = useStore(state => state.setAreas);
  const setTrenches = useStore(state => state.setTrenches);
  const setPhases = useStore(state => state.setPhases);
  const setRelations = useStore(state => state.setRelations);

  const fetchData = async () => {
    try {
      const [
        userData,
        actorData,
        contextData,
        termData,
        projectData,
        areaData,
        trenchData,
        phaseData,
        relationData
      ] = await Promise.all([
        makeRequest('get', `edit_actor?email=ilike.${keycloak.tokenParsed?.email}`, {}, {}),
        makeRequest('get', `edit_actor`, {}, {}),
        makeRequest('get', 'list_context', {}, {}),
        makeRequest('get', 'list_terms', {}, {}),
        makeRequest('get', 'list_projects', {}, {}),
        makeRequest('get', 'list_areas', {}, {}),
        makeRequest('get', 'list_trenches', {}, {}),
        makeRequest('get', 'list_phases', {}, {}),
        makeRequest('get', 'list_relations', {}, {}),
      ]);
      setActiveActor(userData[0]);
      setActors(actorData)

      const transformedTerms = termData.reduce((acc, item) => {
        acc[item.type] = item.terms;
        return acc;
      }, {});
      console.log(transformedTerms)
      let term_types = Object.keys(transformedTerms);
      console.log(term_types)
      setTermTypes(term_types);
      setTerms(transformedTerms);
      setContexts(contextData);
      setProjects(projectData);
      setAreas(areaData);
      setTrenches(trenchData);
      setPhases(phaseData);
      setRelations(relationData);
      setPopData(true);
    } catch (error) {
      console.error('An error occurred while fetching data: ', error);
      setPopData(false);
      // handle error, maybe set a state variable to show an error message.
    }
  };    

  return fetchData
};

export const useSurveyData = () => {
  const { keycloak } = useKeycloak();

  const setPopData = useStore(state => state.setPopData);

  const setActiveActor = useStore(state => state.setActiveActor);
  const setArea = useStore(state => state.setArea);
  const setTract = useStore(state => state.setTract);
  const setScape = useStore(state => state.setScape);
  const setGrid = useStore(state => state.setGrid);
  const setFeat = useStore(state => state.setFeat);  
  const setLine = useStore(state => state.setLine);  
  const setWalker = useStore(state => state.setWalker);
  const setCollType = useStore(state => state.setCollType);
  const setFuncArt = useStore(state => state.setFuncArt);
  const setInfrMod = useStore(state => state.setInfrMod);
  const setLanduse = useStore(state => state.setLanduse);
  const setMatArt = useStore(state => state.setMatArt);
  const setNatFeat = useStore(state => state.setNatFeat);
  const setRecTypeField = useStore(state => state.setRecTypeField);
  const setRecTypeLab = useStore(state => state.setRecTypeLab);
  const setTerrain = useStore(state => state.setTerrain);
  const setScapeType = useStore(state => state.setScapeType);
  const setFeatureType = useStore(state => state.setFeatureType);
  const setNatResource = useStore(state => state.setNatResource);  
  const setDepositGeom = useStore(state => state.setDepositGeom);  
  const setQuarryLayout = useStore(state => state.setQuarryLayout);  
  const setVeg = useStore(state => state.setVeg);
  const setPeriod = useStore(state => state.setPeriod);

  const fetchData = async () => {
    try {
      const [
        userData,
        areaList,
        tractList, 
        scapeList, 
        gridList,
        featList,
        lineList,
        walkerList, 
        collTypeList,
        funcArtList, 
        infrModList, 
        landuseList, 
        matArtList, 
        natFeatList,
        recTypeFieldList,
        recTypeLabList,
        terrainList,
        scapeTypeList,
        featureTypeList,
        scapeNatRecList,
        scapeDepGeomList,
        quarryLayoutList,
        vegList,
        periodList
      ] = await Promise.all([
        makeRequest('get', `edit_actor?email=ilike.${keycloak.tokenParsed?.email}`, {}, {}),
        makeRequest('get', 'list_area', {}, {}),
        makeRequest('get', 'list_tract', {}, {}),
        makeRequest('get', 'list_scape', {}, {}),
        makeRequest('get', 'list_grid', {}, {}),
        makeRequest('get', 'list_feature', {}, {}),
        makeRequest('get', 'list_line', {}, {}),
        makeRequest('get', 'list_walkers', {}, {}),
        makeRequest('get', 'list_collection_type', {}, {}),
        makeRequest('get', 'list_function_artefact', {}, {}),
        makeRequest('get', 'list_infrastructure_modern', {}, {}),
        makeRequest('get', 'list_landuse', {}, {}),
        makeRequest('get', 'list_material_artefact', {}, {}),
        makeRequest('get', 'list_natural_features', {}, {}),
        makeRequest('get', 'list_recording_type_field', {}, {}),
        makeRequest('get', 'list_recording_type_lab', {}, {}),
        makeRequest('get', 'list_terrain', {}, {}),
        makeRequest('get', 'list_scapetypes', {}, {}),
        makeRequest('get', 'list_featuretypes', {}, {}),
        makeRequest('get', 'list_natural_resources', {}, {}),
        makeRequest('get', 'list_deposit_geometry', {}, {}),
        makeRequest('get', 'list_quarry_layout', {}, {}),
        makeRequest('get', 'list_vegetation', {}, {}),
        makeRequest('get', 'list_periods', {}, {})
      ]);
      setActiveActor(userData[0]);
      setArea(areaList);
      setTract(tractList);
      setScape(scapeList);
      setGrid(gridList); 
      setFeat(featList); 
      setLine(lineList); 
      setWalker(walkerList);
      setCollType(collTypeList);
      setFuncArt(funcArtList);
      setInfrMod(infrModList);
      setLanduse(landuseList);
      setMatArt(matArtList);
      setNatFeat(natFeatList);
      setRecTypeField(recTypeFieldList);
      setRecTypeLab(recTypeLabList);
      setTerrain(terrainList);
      setScapeType(scapeTypeList);
      setFeatureType(featureTypeList);
      setNatResource(scapeNatRecList);
      setDepositGeom(scapeDepGeomList);
      setQuarryLayout(quarryLayoutList);
      setVeg(vegList);
      setPeriod(periodList);
      setPopData(true);
    } catch (error) {
      console.error('An error occurred while fetching data: ', error);
      setPopData(false);
      // handle error, maybe set a state variable to show an error message.
    }
  };
  return fetchData
};  

export const useMimaData = () => {
  const { keycloak } = useKeycloak();

  const setPopData = useStore(state => state.setPopData);
  const setActiveActor = useStore(state => state.setActiveActor);
  const setActors = useStore(state => state.setActors);
  const setTerms = useStore(state => state.setTerms);
  const setPlaces = useStore(state => state.setPlaces);
  const setTermTypes = useStore(state => state.setTermTypes);
  const setRecordLookup = useStore(state => state.setRecordLookup);
  const setMediaTypes = useStore(state => state.setMediaTypes);

  const fetchData = async () => {
    try {
      const [
        userData,
        actorData,
        termData,
        placeData,
        recordData,
        mediaTypeData
      ] = await Promise.all([
        makeRequest('get', `edit_actor?email=ilike.${keycloak.tokenParsed?.email}`, {}, {}),
        makeRequest('get', 'list_actors', {}, {}),
        makeRequest('get', 'v_terms', {}, {}),
        makeRequest('get', 'v_place', {}, {}),
        makeRequest('get', 'list_records', {}, {}),
        makeRequest('get', 'lookup_media_type', {}, {}),
      ]);
      setActiveActor(userData[0]);
      setActors(actorData)
      let term_types = Object.keys(termData[0]); 
      setTermTypes(term_types); 
//      let doc_format = termData.find(el => el.term_type === 'doc_format').terms;
//      let doc_support = termData.find(el => el.term_type === 'doc_support').terms;
//      let doc_type = termData.find(el => el.term_type === 'doc_type').terms;
//      let vis_type = termData.find(el => el.term_type === 'vis_type').terms;
//      let vis_material = termData.find(el => el.term_type === 'vis_material').terms;
//      let incarceration_reason = termData.find(el => el.term_type === 'incarceration_reason').terms;
//      let index_topic = termData.find(el => el.term_type === 'index_topic').terms;
//      let keyword = termData.find(el => el.term_type === 'keyword').terms;
//      let tag = termData.find(el => el.term_type === 'tag').terms;
//      let newTerms = {
//        "doc_format": doc_format,
//        "doc_support": doc_support,
//        "doc_type": doc_type,
//        "vis_type": vis_type,
//        "vis_material": vis_material,
//        "incarceration_reason": incarceration_reason,
//        "index_topic": index_topic,
//        "keyword": keyword,
//        "tag": tag
//      };
      setTerms(termData[0]);
      setPlaces(placeData);
      setRecordLookup(recordData);
      setMediaTypes(mediaTypeData);
      setPopData(true);
    } catch (error) {
      console.error('An error occurred while fetching data: ', error);
      setPopData(false);
      // handle error, maybe set a state variable to show an error message.
    }
  };

  return fetchData
};