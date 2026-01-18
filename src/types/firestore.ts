/**
 * Firestore Type Definitions for Digital Folklore Archive
 *
 * This file contains all TypeScript type definitions for Firestore documents,
 * based on the data model specifications in docs/design/05-data-model.md
 * and taxonomy definitions in docs/design/04-taxonomy.md
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Enum Types
// ============================================================================

/**
 * ItemType - 資料種別
 *
 * @description Classification of folklore items by genre/type
 */
export type ItemType =
  | 'KAIDAN' // 怪談
  | 'URBAN_LEGEND' // 都市伝説
  | 'CREEPYPASTA' // クリーピーパスタ
  | 'CHAIN_MEME' // チェーン・ミーム
  | 'ORIGINAL' // 創作
  | 'COMMENTARY'; // 解説

/**
 * Language - 言語
 *
 * @description Primary language of the item
 */
export type Language =
  | 'JA' // 日本語
  | 'EN' // 英語
  | 'OTHER'; // その他

/**
 * SourceConfidence - 出典確度
 *
 * @description Level of confidence in source attribution
 */
export type SourceConfidence =
  | 'PRIMARY' // 原投稿/初出が確認できる
  | 'SECONDARY' // まとめ・引用だが初出に辿れる
  | 'UNKNOWN'; // 初出が辿れない

/**
 * DocStatus - ドキュメント状態
 *
 * @description Publication status of the document
 */
export type DocStatus =
  | 'PUBLISHED' // 公開
  | 'DRAFT'; // 下書き

/**
 * FirstSeen - 初出年代
 *
 * @description Decade when the item first appeared (or more specific date string)
 */
export type FirstSeen =
  | 'Pre-1999' // 1999年以前
  | '2000s' // 2000年代
  | '2010s' // 2010年代
  | '2020s' // 2020年代
  | 'Unknown'; // 不明

/**
 * Motif - モチーフタグ（初期15タグ）
 *
 * @description Thematic tags for categorizing folklore content
 */
export type Motif =
  | 'PLACE' // 場所
  | 'ROAD_TUNNEL' // 道路・トンネル
  | 'FOREST_MOUNTAIN' // 森・山
  | 'WATER' // 水
  | 'ROOM_APARTMENT' // 部屋・アパート
  | 'MISSING_PERSON' // 行方不明者
  | 'STALKER_OBSERVER' // ストーカー・観察者
  | 'ENTITY' // 存在・実体
  | 'DOPPELGANGER' // ドッペルゲンガー
  | 'CHILD_FAMILY' // 子供・家族
  | 'MEDIA_DEVICE' // メディア・デバイス
  | 'RITUAL_RULES' // 儀式・ルール
  | 'WARNING_CHAIN' // 警告・チェーン
  | 'EXPERIMENT_REPORT' // 実験・報告
  | 'IDENTITY'; // アイデンティティ

/**
 * Region - 地域
 *
 * @description Geographical region of origin
 */
export type Region =
  | 'JAPAN' // 日本
  | 'NA' // 北米
  | 'EU' // ヨーロッパ
  | 'ASIA_EX_JAPAN' // アジア（日本除く）
  | 'GLOBAL_UNKNOWN'; // グローバル/不明

/**
 * Medium - 媒体
 *
 * @description Original medium/platform where the item appeared
 */
export type Medium =
  | 'FORUM_BBS' // フォーラム/BBS
  | 'SNS' // SNS
  | 'VIDEO' // 動画
  | 'WIKI_ARCHIVE' // Wiki/アーカイブ
  | 'PRINT_ORAL' // 印刷物/口承
  | 'UNKNOWN'; // 不明

// ============================================================================
// Multilingual Text Types
// ============================================================================

/**
 * BilingualText - 多言語テキスト（日英）
 *
 * @description Standard bilingual text structure for titles and annotations
 */
export interface BilingualText {
  /** 日本語テキスト */
  ja?: string;
  /** 英語テキスト */
  en?: string;
}

/**
 * BodyText - 本文テキスト（原文含む）
 *
 * @description Extended bilingual text with optional original language field
 */
export interface BodyText extends BilingualText {
  /**
   * 原文（原語のまま）
   * @description Original text in its native language if different from ja/en
   */
  original?: string;
}

// ============================================================================
// Main Document Types
// ============================================================================

/**
 * ItemDoc - 資料ドキュメント
 *
 * @description Main collection document representing a folklore item
 * @collection /items/{id}
 */
export interface ItemDoc {
  /** Document ID in format "DTA-XXXXXX" */
  id: string;

  /** 資料種別 */
  type: ItemType;

  /** 主要言語 */
  language: Language;

  /** 出典確度 */
  confidence: SourceConfidence;

  /** タイトル（多言語） */
  title: BilingualText;

  /**
   * 原題（原語のまま）
   * @description Original title if different from ja/en versions
   */
  originalTitle?: string;

  /** 本文（多言語） */
  body: BodyText;

  /**
   * 初出年代
   * @description Can be a decade ("2010s") or specific date ("2023-08")
   */
  firstSeen?: FirstSeen | string;

  /**
   * 出典名
   * @example "2ch", "reddit", "wiki"
   */
  sourceName?: string;

  /** 初出URL */
  sourceUrl?: string;

  /** アーカイブURL */
  sourceArchiveUrl?: string;

  /**
   * モチーフタグ
   * @description Array of motif tags (max 3 recommended)
   */
  motifs: Motif[];

  /**
   * 形式タグ
   * @description Optional format tags (extensible)
   */
  formats?: string[];

  /** 地域 */
  region?: Region;

  /** 媒体 */
  medium?: Medium;

  /**
   * 注釈数
   * @description Count of annotations for sorting/display
   */
  annotationCount?: number;

  /**
   * 版履歴数
   * @description Count of revisions for sorting/display
   */
  revisionCount?: number;

  /** 公開状態 */
  status: DocStatus;

  /** 作成日時 */
  createdAt: Timestamp;

  /** 更新日時 */
  updatedAt: Timestamp;

  /**
   * 検索トークン配列
   * @description Auto-generated tokens for full-text search
   * @see src/lib/catalog/searchTokens.ts
   */
  searchTokens?: string[];
}

/**
 * RevisionDoc - 版履歴ドキュメント
 *
 * @description Tracks revision history of items
 * @collection /items/{id}/revisions/{revId}
 */
export interface RevisionDoc {
  /** 版更新日時 */
  at: Timestamp;

  /** 更新内容サマリー（多言語） */
  summary: BilingualText;

  /**
   * 編集者UID
   * @description Firebase Auth UID of the editor
   */
  editorUid?: string;
}

/**
 * AnnotationDoc - 注釈ドキュメント
 *
 * @description Footnotes and annotations for items
 * @collection /items/{id}/annotations/{noteId}
 */
export interface AnnotationDoc {
  /**
   * 表示順序
   * @description Numerical order (1, 2, 3, ...)
   */
  order: number;

  /** 注釈テキスト（多言語） */
  text: BilingualText;
}

/**
 * CollectionDoc - 棚（コレクション）ドキュメント
 *
 * @description Curated collections of items
 * @collection /collections/{slug}
 */
export interface CollectionDoc {
  /** URLスラッグ (e.g., "missing-person") */
  slug: string;

  /**
   * タイトル（多言語・必須）
   * @description Both ja and en are required
   */
  title: Required<BilingualText>;

  /** 説明（多言語） */
  description?: BilingualText;

  /**
   * 含まれる資料ID配列
   * @description Array of item document IDs in this collection
   */
  itemIds: string[];

  /** 公開状態 */
  status: DocStatus;

  /** 作成日時 */
  createdAt: Timestamp;

  /** 更新日時 */
  updatedAt: Timestamp;
}
