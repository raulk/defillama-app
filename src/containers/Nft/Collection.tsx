import * as React from 'react'
import Layout from '~/layout'
import { DetailsWrapper, Name, ChartWrapper, ChartsWrapper, LazyChart, Button } from '~/layout/ProtocolAndPool'
import { StatsSection } from '~/layout/Stats/Medium'
import { Stat } from '~/layout/Stats/Large'
import TokenLogo from '~/components/TokenLogo'
import FormattedName from '~/components/FormattedName'
import { nftCollectionIconUrl } from '~/utils'
import dynamic from 'next/dynamic'
import type { ICollectionScatterChartProps } from './types'
import { IBarChartProps, IChartProps } from '~/components/ECharts/types'
import { ArrowUpRight } from 'react-feather'
import Link from 'next/link'

const CollectionScatterChart = dynamic(() => import('./CollectionScatterChart'), {
	ssr: false
}) as React.FC<ICollectionScatterChartProps>

const AreaChart = dynamic(() => import('~/components/ECharts/AreaChart'), {
	ssr: false
}) as React.FC<IChartProps>

const BarChart = dynamic(() => import('~/components/ECharts/BarChart'), {
	ssr: false
}) as React.FC<IBarChartProps>

const flagOutliers = (sales) => {
	const values = sales.map((s) => s[1])
	const mean = values.reduce((acc, val) => acc + val, 0) / values.length
	const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1))
	// zscores
	const scores = values.map((s) => Math.abs((s - mean) / std))
	// sigma threshold
	return sales.map((s, i) => [...s, scores[i] >= 2])
}

export function NFTCollectionContainer({ name, data, stats, sales, address, floorHistory }) {
	const floorPrice = floorHistory[floorHistory.length - 1]?.[1]
	const volume24h = stats[stats.length - 1]?.[1]

	const salesExOutliers = flagOutliers(sales).filter((i) => i[2] === false)

	return (
		<Layout title={(name || 'NFTs') + ' - DefiLlama'}>
			<StatsSection>
				<DetailsWrapper>
					<Name>
						<TokenLogo logo={nftCollectionIconUrl(address)} fallbackLogo={data?.[0]?.image} size={24} />
						<FormattedName text={name} fontWeight={700} />
					</Name>

					<Stat>
						<span>Total Supply</span>
						<span>{data?.[0]?.totalSupply}</span>
					</Stat>

					<Stat>
						<span>Floor Price</span>
						<span>{floorPrice ? floorPrice.toFixed(2) + ' ETH' : ''}</span>
					</Stat>

					<Stat>
						<span>24h Volume</span>
						<span>{volume24h ? volume24h.toFixed(2) + ' ETH' : ''}</span>
					</Stat>

					<Link href={`https://etherscan.io/token/${address.split(':')[0]}`} passHref>
						<Button
							as="a"
							target="_blank"
							rel="noopener noreferrer"
							useTextColor={true}
							style={{ width: 'fit-content' }}
						>
							<span>View on Etherscan</span> <ArrowUpRight size={14} />
						</Button>
					</Link>
				</DetailsWrapper>

				<ChartWrapper>
					<CollectionScatterChart sales={salesExOutliers} />
				</ChartWrapper>
			</StatsSection>

			<ChartsWrapper>
				<LazyChart>
					<AreaChart chartData={floorHistory} hideDefaultLegend valueSymbol="ETH" title="Floor Price" />
				</LazyChart>
				<LazyChart>
					<BarChart chartData={stats} hideDefaultLegend valueSymbol="ETH" title="Volume" />
				</LazyChart>
			</ChartsWrapper>
		</Layout>
	)
}