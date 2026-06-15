# Events Reference — Supply Projects

All constants live in `lib/analytics/events.ts`.

## Identity
| Event | Where |
|-------|-------|
| `User Identified` | MixpanelProvider — on auth load |
| `User Logged Out` | MixpanelProvider — on signOut |

## Navigation
| Event | Where |
|-------|-------|
| `Page Viewed` | MixpanelProvider — every route change (auto) |
| `Supply Home Viewed` | `app/supply/page.tsx` |
| `Supply Home Session Ended` | `app/supply/page.tsx` — unmount |
| `Supply Tab Switched` | `app/supply/page.tsx` — tab click |
| `Kanban Viewed` | `app/supply/kanban/page.tsx` |
| `Kanban Session Ended` | `app/supply/kanban/page.tsx` — unmount |
| `Kanban View Mode Changed` | `app/supply/kanban/page.tsx` |
| `Property Detail Viewed` | `app/supply/property/[id]/page.tsx` |
| `Property Detail Session Ended` | `app/supply/property/[id]/page.tsx` — unmount |
| `Property Tab Switched` | `components/supply/property/property-detail-page.tsx` |
| `Property Edit Viewed` | `app/supply/property/[id]/edit/page.tsx` |
| `Property Edit Section Viewed` | `app/supply/property/[id]/edit/page.tsx` |
| `Property Edit Section Completed` | `app/supply/property/[id]/edit/page.tsx` — Continuar |
| `Financial Estimate Viewed` | `app/supply/property/[id]/financial-estimate/page.tsx` |
| `Contract Page Viewed` | `app/supply/property/[id]/contract/page.tsx` |

## Kanban actions
| Event | Where |
|-------|-------|
| `Add Property Clicked` | `app/supply/kanban/page.tsx` |
| `Kanban Card Clicked` | `hooks/use-supply-kanban-board-data.ts` |
| `Kanban Search Performed` | `app/supply/kanban/page.tsx` — debounced |
| `Go to Kanban Clicked` | `app/supply/page.tsx` / `supply-sidebar.tsx` |

## Property lifecycle
| Event | Where |
|-------|-------|
| `Property Created` | `components/supply/add-property-form.tsx` — submit success |
| `Property Creation Failed` | `components/supply/add-property-form.tsx` — submit catch |
| `Property Edit Started` | kanban card click / detail Edit button |
| `Property Saved` | `app/supply/property/[id]/edit/page.tsx` — handleSave |
| `Property Submitted to Review` | `app/supply/property/[id]/edit/page.tsx` — handleSubmit |
| `Property Edit Abandoned` | `app/supply/property/[id]/edit/page.tsx` — back without save |
| `Property Deleted` | `app/supply/property/[id]/edit/page.tsx` — confirmDelete |
| `Property Approved` | `components/supply/property/property-detail-page.tsx` |
| `Property Discarded` | `components/supply/property/property-detail-page.tsx` |
| `Track Type Selected` | `components/supply/property/property-detail-page.tsx` |
| `Property Moved to Negotiation` | `components/supply/property/property-detail-page.tsx` |
| `Corrections Submitted` | after POST `/api/corrections-webhook` |
| `Financial Estimate CTA Clicked` | `components/supply/property/property-detail-page.tsx` |

## Financial estimate
| Event | Where |
|-------|-------|
| `Financial Estimate Form Started` | `components/supply/financial-estimate/basic-information-form.tsx` |
| `Financial Estimate Created` | `app/supply/property/[id]/financial-estimate/page.tsx` — handleGenerate |
| `Financial Estimate Updated` | `app/supply/property/[id]/financial-estimate/page.tsx` — handleSaveChanges |

## Add property form (funnel)
| Event | Where |
|-------|-------|
| `Add Property Form Started` | `components/supply/add-property-form.tsx` — first field focus |
| `Add Property Form Abandoned` | `components/supply/add-property-form.tsx` — modal close without submit |
| `Add Property Form Completed` | `components/supply/add-property-form.tsx` — submit success |

## Files
| Event | Where |
|-------|-------|
| `File Uploaded` | `hooks/useFileUpload.ts` — upload success |
| `File Upload Failed` | `hooks/useFileUpload.ts` — upload catch |

## Contract / Arras
| Event | Where |
|-------|-------|
| `Contract PDF Generated` | after POST `/api/contracts/generate-pdf` |
| `Contract Sent for Signature` | after POST `/api/contracts/send-for-signature` |
| `Contract Signed` | `app/api/contracts/docusign-webhook` — server-side |
| `Arras Submitted` | after POST `/api/arras/submit` |

## Proyecto — Navigation
| Event | Where |
|-------|-------|
| `Project Home Viewed` | `components/supply/home/projects-dashboard.tsx` — mount |
| `Project Kanban Viewed` | `app/proyecto/kanban/page.tsx` — mount |
| `Project Detail Viewed` | `app/proyecto/[id]/page.tsx` — after project loads |
| `Project Detail Session Ended` | `app/proyecto/[id]/page.tsx` — unmount |
| `Project Tab Switched` | `app/proyecto/[id]/page.tsx` — `switchTab()` helper |

## Proyecto — Lifecycle
| Event | Where |
|-------|-------|
| `Project Submitted to Review` | `app/proyecto/[id]/page.tsx` — `doUploadProject()` success |
| `Project Upload Blocked` | `app/proyecto/[id]/page.tsx` — `doUploadProject()` early return |
| `Project Accepted` | `app/proyecto/[id]/page.tsx` — `doAcceptProject()` success |
| `Project External Reno Confirmed` | `app/proyecto/[id]/page.tsx` — `completeExternalRenoAcceptance()` |
| `Project Phase Advanced` | `app/proyecto/[id]/page.tsx` — `handleAdvanceToCommercialReadiness()` / `handleAdvanceToInCommercialisation()` |
| `Project Phase Advance Blocked` | `app/proyecto/[id]/page.tsx` — advance handlers early return |
| `Project Discarded` | `app/proyecto/[id]/page.tsx` — `handleDiscardProject()` success |
| `Project Recovered` | `app/proyecto/[id]/page.tsx` — `handleRecoverProject()` success |

## Proyecto — CRM
| Event | Where |
|-------|-------|
| `Project Offer Status Changed` | `app/proyecto/[id]/page.tsx` — `handleOfferStatusChange()` |
| `Project Opportunity Stage Changed` | `app/proyecto/[id]/page.tsx` — `handleOpportunityStageChange()` |
| `Project Assignee Changed` | `app/proyecto/[id]/page.tsx` — `handleAssignScouter/Analyst/RenoAnalyst()` |

## Proyecto — Financial CTA (from project detail page)
| Event | Where |
|-------|-------|
| `Project Financial CTA Clicked` | `app/proyecto/[id]/page.tsx` — `handleEditFinancial/ViewFinancial/NewFinancial()` |

## Proyecto — Renovation budget (`/proyecto/[id]/budget`)
| Event | Where |
|-------|-------|
| `Project Reno Budget Mode Selected` | `app/proyecto/[id]/budget/page.tsx` — chooser buttons (`total_only` / `full_breakdown`) |
| `Project Reno Budget Draft Saved` | `app/proyecto/[id]/budget/page.tsx` — `handleSaveDraft()` |
| `Project Reno Budget Locked` | `app/proyecto/[id]/budget/page.tsx` — `handleApproveAndLock()` · `components/proyecto/unit-budget-editor.tsx` — `handleLock()` |
| `Project Reno Budget Total Only Submitted` | `app/proyecto/[id]/budget/page.tsx` — `handleSubmitTotalOnlyFromTab()` |

## Proyecto — Deck management
| Event | Where |
|-------|-------|
| `Project Decks Regenerated` | `project-deck-management-tab.tsx` + `project-deck-editor-screen.tsx` — `handleRegenerate()` |
| `Project Deck Editor Opened` | `project-deck-management-tab.tsx` — `openEditor()` |
| `Project Deck Public Link Copied` | `project-deck-management-tab.tsx` + `project-deck-editor-screen.tsx` — `copyPublicDeckLink()` |
| `Project Deck Public View Opened` | `project-deck-editor-screen.tsx` — `openHtmlPublic()` |

## Proyecto — Commercial readiness tab
| Event | Where |
|-------|-------|
| `Project Readiness Scope Changed` | `commercial-readiness-tab.tsx` — scope buttons (`project` / `pack`) |
| `Project Readiness Requirement Toggled` | `commercial-readiness-tab.tsx` — `persistManualDone()` |
| `Project Readiness CTA Clicked` | `commercial-readiness-tab.tsx` — `runCta()` (checklist / documents / financial / deposits / rentals) |

## Proyecto — Documents tab
| Event | Where |
|-------|-------|
| `Project Document Uploaded` | `project-documents-tab.tsx` — `uploadToSlot()` success |
| `Project Document Deleted` | `project-documents-tab.tsx` — `handleDelete()` |
| `Project Document Previewed` | `project-documents-tab.tsx` — `handlePreview()` |
| `Project Document Downloaded` | `project-documents-tab.tsx` — `handleDownload()` |

## Proyecto — Gantt / Timeline tab
| Event | Where |
|-------|-------|
| `Project Gantt Exported` | `pipeline-gantt-tab.tsx` — export menu (`json` / `png` / `pdf`) |
| `Project Gantt Zoom Changed` | `pipeline-gantt-tab.tsx` — zoom buttons |
| `Project Gantt Fullscreen Toggled` | `pipeline-gantt-tab.tsx` — fullscreen button |

## Proyecto — Financial wizard (`/proyecto/add`)
| Event | Where |
|-------|-------|
| `Project Financial Saved` | `app/proyecto/add/page.tsx` — `handleSaveChanges()` (manual only, not auto-save) |
| `Project Financial Closed` | `app/proyecto/add/page.tsx` — `handleCreateEstimation()` success (lock) |
| `Project Financial Packs Opened` | `app/proyecto/add/page.tsx` — "Gestionar packs" button |
| `Project Financial Typology Opened` | `app/proyecto/add/page.tsx` — "Cargar precios por tipología" button |
| `Project Financial Typology Applied` | `app/proyecto/add/page.tsx` — `handleTypologyApply()` |
| `Project Financial Type Changed` | `app/proyecto/add/page.tsx` — `handleProjectTypeChange()` (Yield ↔ Flip) |
| `Project Financial Table Tab Switched` | `flip-profitability-table.tsx` (IVP/Ventas finales/TIR) + `property-profitability-table.tsx` (Tabla financiera/Plan de pago) |
| `Project Financial Template Downloaded` | `components/proyecto/financial-section-actions-menu.tsx` |
| `Project Financial CSV Imported` | `components/proyecto/financial-section-actions-menu.tsx` — `runImport()` success |
| `Project Financial CSV Import Failed` | `components/proyecto/financial-section-actions-menu.tsx` — `runImport()` error |

## Proyecto — Kanban actions
| Event | Where |
|-------|-------|
| `Project Add Clicked` | `app/proyecto/kanban/page.tsx` — `handleAddProject()` |
| `Project Kanban Card Clicked` | `hooks/use-proyecto-kanban-board-data.ts` — `handleCardClick()` |
| `Project Kanban Filter Changed` | `app/proyecto/kanban/page.tsx` — investment type filter |
| `Project Kanban View Changed` | `app/proyecto/kanban/page.tsx` — view switcher |

---

## Adding events for a new feature — naming conventions

- **Screens:** `[Entity] Viewed`, `[Entity] Session Ended`
- **Actions:** `[Entity] [Past tense verb]` — e.g. `Project Created`, `Budget Approved`
- **Forms:** `[Form Name] Form Started / Completed / Abandoned`
- **Navigation:** `[Destination] Clicked`, `[Tab] Tab Switched`
- **Errors:** `[Action] Failed`

Keep event names in **Title Case**. Properties in **snake_case**.
