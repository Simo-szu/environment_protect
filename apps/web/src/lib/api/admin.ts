import { apiDelete, apiGet, apiPatch, apiPost } from '../api-client';
import { PageResponse } from '../api-types';

export interface AdminHostVerificationItem {
  userId: string;
  orgName: string;
  contactName: string;
  contactPhone: string;
  docUrls?: string[];
  status: number;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface AdminReviewVerificationRequest {
  status: 2 | 3;
  reviewNote?: string;
}

export interface AdminHomeBannerItem {
  id: string;
  title?: string;
  imageUrl: string;
  linkType: number;
  linkTarget?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  startAt?: string;
  endAt?: string;
}

export interface AdminCreateHomeBannerRequest {
  title?: string;
  imageUrl: string;
  linkType: number;
  linkTarget?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  startAt?: string;
  endAt?: string;
}

export interface AdminUpdateHomeBannerRequest {
  title?: string;
  imageUrl?: string;
  linkType?: number;
  linkTarget?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  startAt?: string;
  endAt?: string;
}

export interface AdminContentItem {
  id: string;
  type: number;
  title: string;
  summary?: string;
  coverUrl?: string;
  publishedAt?: string;
  status: number;
  createdAt: string;
  likeCount?: number;
  favCount?: number;
  commentCount?: number;
  hotScore?: number;
}

export interface AdminContentDetail extends AdminContentItem {
  body?: string;
  sourceType?: number;
  sourceUrl?: string;
  updatedAt?: string;
  downCount?: number;
}

export interface AdminCreateContentRequest {
  type: number;
  title: string;
  summary?: string;
  coverUrl?: string;
  body: string;
  sourceType: number;
  sourceUrl?: string;
  publishedAt?: string;
  status?: number;
}

export interface AdminUpdateContentRequest {
  type?: number;
  title?: string;
  summary?: string;
  coverUrl?: string;
  body?: string;
  status?: number;
}

export interface AdminGameCardItem {
  cardId: string;
  cardNo: number;
  chineseName: string;
  englishName: string;
  cardType: 'core' | 'policy';
  domain: 'industry' | 'ecology' | 'science' | 'society' | 'policy';
  star: number;
  phaseBucket: 'early' | 'mid' | 'late' | 'policy';
  unlockCost: {
    industry: number;
    tech: number;
    population: number;
    green: number;
  };
  imageKey?: string;
  advancedImageKey?: string;
}

export interface AdminCreateGameCardRequest {
  cardId: string;
  cardNo: number;
  chineseName: string;
  englishName: string;
  cardType: 'core' | 'policy';
  domain: 'industry' | 'ecology' | 'science' | 'society' | 'policy';
  star: number;
  phaseBucket: 'early' | 'mid' | 'late' | 'policy';
  unlockCostIndustry: number;
  unlockCostTech: number;
  unlockCostPopulation: number;
  unlockCostGreen: number;
  imageKey?: string;
  advancedImageKey?: string;
  isEnabled?: boolean;
}

export interface AdminUpdateGameCardRequest {
  cardNo?: number;
  chineseName?: string;
  englishName?: string;
  cardType?: 'core' | 'policy';
  domain?: 'industry' | 'ecology' | 'science' | 'society' | 'policy';
  star?: number;
  phaseBucket?: 'early' | 'mid' | 'late' | 'policy';
  unlockCostIndustry?: number;
  unlockCostTech?: number;
  unlockCostPopulation?: number;
  unlockCostGreen?: number;
  imageKey?: string;
  advancedImageKey?: string;
  isEnabled?: boolean;
}

export interface AdminBalanceRule {
  configId?: number;
  initialPhase?: string;
  initialEventCooldown?: number;
  boardSize?: number;
  initialIndustry?: number;
  initialTech?: number;
  initialPopulation?: number;
  initialGreen?: number;
  initialCarbon?: number;
  initialSatisfaction?: number;
  initialLowCarbonScore?: number;
  initialQuota?: number;
  initialDrawEarly?: number;
  drawCountEarly?: number;
  drawCountMid?: number;
  drawCountLate?: number;
  eventCooldownResetTurns?: number;
  settlementBaseIndustryGain?: number;
  settlementBaseTechGain?: number;
  settlementBasePopulationGain?: number;
  satisfactionMax?: number;
  carbonQuotaBaseLine?: number;
  carbonQuotaPerNOver?: number;
  carbonIndustryEmissionPerCard?: number;
  carbonEcologyReductionPerCard?: number;
  carbonScienceReductionPerCard?: number;
  tradeRandomBaseMin?: number;
  tradeRandomSpan?: number;
  tradeHighCarbonThreshold?: number;
  tradeHighCarbonFactor?: number;
  tradeLowCarbonThreshold?: number;
  tradeLowCarbonFactor?: number;
  failureHighCarbonThreshold?: number;
  failureHighCarbonStreakLimit?: number;
  tradeFailureQuotaExhaustedLimit?: number;
  tradeFailureProfitThreshold?: number;
  lowCarbonMinForPositiveEnding?: number;
  lowCarbonDomainThreshold?: number;
  lowCarbonDomainBonus?: number;
  lowCarbonPolicyUnlockScore?: number;
  lowCarbonPolicyUnlockAllCount?: number;
  lowCarbonPolicyUnlockAllBonus?: number;
  lowCarbonEventResolvedScore?: number;
  lowCarbonEventTriggeredPenalty?: number;
  lowCarbonOverLimitCarbonThreshold?: number;
  lowCarbonOverLimitStreakThreshold?: number;
  lowCarbonOverLimitStreakPenalty?: number;
  lowCarbonTradeProfitDivisor?: number;
  lowCarbonTradeProfitBonus?: number;
  lowCarbonQuotaExhaustedPenalty?: number;
  lowCarbonInvalidOperationPenalty?: number;
  carbonTier1Max?: number;
  carbonTier1Score?: number;
  carbonTier2Max?: number;
  carbonTier2Score?: number;
  carbonTier3Max?: number;
  carbonTier3Score?: number;
  carbonTier4Max?: number;
  carbonTier4Score?: number;
  carbonTier5Score?: number;
  phaseEarlyMaxCards?: number;
  phaseEarlyMaxScore?: number;
  phaseMidMinCards?: number;
  phaseMidMaxCards?: number;
  phaseMidMinScore?: number;
  phaseMidMaxScore?: number;
  phaseLateMinCards?: number;
  phaseLateMinScore?: number;
  phaseLateRemainingCardsThreshold?: number;
  endingEventResolveRateRequired?: number;
  endingInnovationMinScience?: number;
  endingInnovationMinTech?: number;
  endingInnovationMinLowCarbon?: number;
  endingInnovationMaxCarbon?: number;
  endingInnovationMinProfit?: number;
  endingEcologyMinEcology?: number;
  endingEcologyMinGreen?: number;
  endingEcologyMinLowCarbon?: number;
  endingEcologyMaxCarbon?: number;
  endingEcologyMinQuota?: number;
  endingDoughnutMinSociety?: number;
  endingDoughnutMinSatisfaction?: number;
  endingDoughnutMinPopulation?: number;
  endingDoughnutMinDomain?: number;
  endingDoughnutMinLowCarbon?: number;
  endingDoughnutMaxCarbon?: number;
  endingDoughnutMinPolicyUsage6768?: number;
  isEnabled?: boolean;
}

export interface AdminEventRule {
  eventType: string;
  triggerProbabilityPct?: number;
  minGreen?: number | null;
  minCarbon?: number | null;
  maxSatisfaction?: number | null;
  minPopulation?: number | null;
  requireEvenTurn?: boolean;
  weight?: number;
  durationTurns?: number;
  greenDelta?: number;
  carbonDelta?: number;
  satisfactionDelta?: number;
  greenPctDelta?: number;
  populationPctDelta?: number;
  quotaDelta?: number;
  displayName?: string;
  effectSummary?: string;
  resolutionHint?: string;
  resolvablePolicyIdsCsv?: string;
  isEnabled?: boolean;
}

export interface AdminComboRule {
  comboId: string;
  priorityOrder?: number;
  requiredPolicyId?: string;
  minIndustry?: number;
  minEcology?: number;
  minScience?: number;
  minSociety?: number;
  minLowCarbonIndustry?: number;
  minShenzhenEcology?: number;
  minLinkCards?: number;
  minIndustryLowCarbonAdjacentPairs?: number;
  minScienceScienceAdjacentPairs?: number;
  minScienceIndustryAdjacentPairs?: number;
  minIndustryEcologyAdjacentPairs?: number;
  minSocietyEcologyAdjacentPairs?: number;
  effectIndustryDelta?: number;
  effectTechDelta?: number;
  effectPopulationDelta?: number;
  effectGreenDelta?: number;
  effectCarbonDelta?: number;
  effectSatisfactionDelta?: number;
  effectQuotaDelta?: number;
  effectLowCarbonDelta?: number;
  effectTechPct?: number;
  effectPopulationPct?: number;
  effectIndustryPct?: number;
  effectLowCarbonPct?: number;
  effectGreenPct?: number;
  effectGlobalPct?: number;
  isEnabled?: boolean;
}

export interface AdminPolicyUnlockRule {
  policyId: string;
  priorityOrder?: number;
  minIndustry?: number;
  minEcology?: number;
  minScience?: number;
  minSociety?: number;
  minIndustryResource?: number;
  minTechResource?: number;
  minPopulationResource?: number;
  minGreen?: number | null;
  minCarbon?: number | null;
  maxCarbon?: number | null;
  minSatisfaction?: number | null;
  minTaggedCards?: number;
  requiredTag?: string;
  isEnabled?: boolean;
}

export interface AdminCoreSpecialCondition {
  cardId: string;
  requiredEventType?: string;
  minIndustryCards?: number;
  minEcologyCards?: number;
  minScienceCards?: number;
  minSocietyCards?: number;
  isEnabled?: boolean;
}

export interface AdminCardTag {
  cardId: string;
  tagCode: string;
  isEnabled?: boolean;
}

export interface AdminEndingContent {
  endingId: string;
  endingName?: string;
  imageKey?: string;
  defaultReason?: string;
  failureReasonHighCarbon?: string;
  failureReasonTrade?: string;
  failureReasonLowScore?: string;
  failureReasonBoundaryDefault?: string;
  isEnabled?: boolean;
}

export interface AdminGameRulesConfig {
  runtimeParam: AdminGameRuntimeParam | null;
  balanceRule: AdminBalanceRule | null;
  eventRules: AdminEventRule[];
  comboRules: AdminComboRule[];
  policyUnlockRules: AdminPolicyUnlockRule[];
  coreSpecialConditions: AdminCoreSpecialCondition[];
  cardTags: AdminCardTag[];
  endingContents: AdminEndingContent[];
}

export interface AdminGameRuntimeParam {
  configId?: number;
  coreHandLimit?: number;
  policyHandLimit?: number;
  maxComboPerTurn?: number;
  maxTurn?: number;
  handDiscardDecisionSeconds?: number;
  tradeWindowInterval?: number;
  tradeWindowSeconds?: number;
  baseCarbonPrice?: number;
  maxCarbonQuota?: number;
  domainProgressCardCap?: number;
  freePlacementEnabled?: boolean;
  endingDisplaySeconds?: number;
  turnTransitionAnimationEnabledDefault?: boolean;
  turnTransitionAnimationSeconds?: number;
}

export interface AdminUpdateGameRulesRequest {
  runtimeParam?: AdminGameRuntimeParam | null;
  balanceRule?: AdminBalanceRule | null;
  eventRules?: AdminEventRule[] | null;
  comboRules?: AdminComboRule[] | null;
  policyUnlockRules?: AdminPolicyUnlockRule[] | null;
  coreSpecialConditions?: AdminCoreSpecialCondition[] | null;
  cardTags?: AdminCardTag[] | null;
  endingContents?: AdminEndingContent[] | null;
}

export async function getAdminHostVerifications(params: {
  status?: number;
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminHostVerificationItem>> {
  return apiGet<PageResponse<AdminHostVerificationItem>>('/api/v1/admin/host/verifications', params);
}

export async function reviewAdminHostVerification(
  userId: string,
  data: AdminReviewVerificationRequest
): Promise<void> {
  return apiPatch<void>(`/api/v1/admin/host/verifications/${userId}`, data);
}

export async function getAdminHomeBanners(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminHomeBannerItem>> {
  return apiGet<PageResponse<AdminHomeBannerItem>>('/api/v1/admin/home/banners', params);
}

export async function getAdminHomeBannerById(id: string): Promise<AdminHomeBannerItem> {
  return apiGet<AdminHomeBannerItem>(`/api/v1/admin/home/banners/${id}`);
}

export async function createAdminHomeBanner(data: AdminCreateHomeBannerRequest): Promise<string> {
  return apiPost<string>('/api/v1/admin/home/banners', data);
}

export async function updateAdminHomeBanner(id: string, data: AdminUpdateHomeBannerRequest): Promise<void> {
  return apiPatch<void>(`/api/v1/admin/home/banners/${id}`, data);
}

export async function deleteAdminHomeBanner(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/home/banners/${id}`);
}

export async function getAdminContents(params: {
  type?: number;
  status?: number;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminContentItem>> {
  return apiGet<PageResponse<AdminContentItem>>('/api/v1/admin/contents', params);
}

export async function getAdminContentById(id: string): Promise<AdminContentDetail> {
  return apiGet<AdminContentDetail>(`/api/v1/admin/contents/${id}`);
}

export async function createAdminContent(data: AdminCreateContentRequest): Promise<string> {
  return apiPost<string>('/api/v1/admin/contents', data);
}

export async function updateAdminContent(id: string, data: AdminUpdateContentRequest): Promise<void> {
  return apiPatch<void>(`/api/v1/admin/contents/${id}`, data);
}

export async function publishAdminContent(id: string): Promise<void> {
  return apiPost<void>(`/api/v1/admin/contents/${id}/publish`, {});
}

export async function deleteAdminContent(id: string): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/contents/${id}`);
}

export async function getAdminGameCards(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminGameCardItem>> {
  return apiGet<PageResponse<AdminGameCardItem>>('/api/v1/admin/game/cards', params);
}

export async function getAdminGameCardById(cardId: string): Promise<AdminGameCardItem> {
  return apiGet<AdminGameCardItem>(`/api/v1/admin/game/cards/${cardId}`);
}

export async function createAdminGameCard(data: AdminCreateGameCardRequest): Promise<string> {
  return apiPost<string>('/api/v1/admin/game/cards', data);
}

export async function updateAdminGameCard(cardId: string, data: AdminUpdateGameCardRequest): Promise<void> {
  return apiPatch<void>(`/api/v1/admin/game/cards/${cardId}`, data);
}

export async function deleteAdminGameCard(cardId: string): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/game/cards/${cardId}`);
}

export async function getAdminGameRules(): Promise<AdminGameRulesConfig> {
  return apiGet<AdminGameRulesConfig>('/api/v1/admin/game/rules');
}

export async function updateAdminGameRules(data: AdminUpdateGameRulesRequest): Promise<void> {
  return apiPatch<void>('/api/v1/admin/game/rules', data);
}

export interface AdminIngestionReport {
  sourceKey: string;
  fetched: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface AdminDailyIngestionSummary {
  startedAt: string;
  finishedAt: string;
  reports: AdminIngestionReport[];
}

export async function triggerAdminIngestion(): Promise<AdminDailyIngestionSummary> {
  return apiPost<AdminDailyIngestionSummary>('/api/v1/admin/contents/ingestion/trigger', {});
}

export interface AdminIngestionSourceSettings {
  enabled: boolean;
  maxPages: number;
  maxArticles: number;
}

export interface AdminIngestionSettings {
  cron: string;
  zone: string;
  enabled: boolean;
  publishStatus: number;
  requestTimeoutMs: number;
  requestIntervalMs: number;
  earth: AdminIngestionSourceSettings;
  ecoepn: AdminIngestionSourceSettings;
}

export interface AdminUpdateIngestionSettingsRequest {
  cron: string;
  zone: string;
  enabled: boolean;
  publishStatus: number;
  requestTimeoutMs: number;
  requestIntervalMs: number;
  earth: AdminIngestionSourceSettings;
  ecoepn: AdminIngestionSourceSettings;
}

export async function getAdminIngestionSettings(): Promise<AdminIngestionSettings> {
  return apiGet<AdminIngestionSettings>('/api/v1/admin/contents/ingestion/settings');
}

export async function updateAdminIngestionSettings(
  data: AdminUpdateIngestionSettingsRequest
): Promise<AdminIngestionSettings> {
  return apiPatch<AdminIngestionSettings>('/api/v1/admin/contents/ingestion/settings', data);
}
