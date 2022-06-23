({
    init: function () {
        leftSide("fas fa-fw fa-home", i18n("houses.houses"), "#houses", false, true);

        $(".sidebar .nav-item a[href='#houses']").on("click", function (event) {
            event.stopPropagation();
            return false;
        });

        moduleLoaded("houses", this);
    },

    cmses: function (domophoneId, selected) {
        let c = [];

        c.push({
            id: "0",
            text: i18n("no"),
        });

        for (let id in modules.houses.meta.cmses) {
            if (domophoneId && modules.houses.meta.domophoneModels[domophoneId] && modules.houses.meta.domophoneModels[domophoneId].cmses.indexOf(id.split(".json")[0]) >= 0) {
                c.push({
                    id: id,
                    text: modules.houses.meta.cmses[id].title,
                    selected: selected === id,
                })
            }
        }

        return c;
    },

    outputs: function (domophoneModel, selected) {
        let o = [];

        for (let i = 0; i < 32; i++) {
            if (domophoneModel && modules.houses.meta.domophoneModels[domophoneModel] && i < parseInt(modules.houses.meta.domophoneModels[domophoneModel].outputs)) {
                o.push({
                    id: i.toString(),
                    text: i?i18n("houses.domophoneOutputSecondary", i):i18n("houses.domophoneOutputPrimary"),
                    selected: selected === i,
                });
            }
        }

        return o;
    },

    domophoneIdSelect: (el, id, prefix) => {
        $(`#${prefix}cms`).html("").select2({
            data: modules.houses.cmses(modules.houses.meta.domophoneModelsById[el.val()]),
            language: lang["_code"],
        });

        let h = "";

        let o = modules.houses.outputs(modules.houses.meta.domophoneModelsById[el.val()]);
        for (let i in o) {
            h += `<option value="${o[i].id}" ${o[i].selected?"selected":""}>${o[i].text}</option>`;
        }

        $("#" + prefix + "domophoneOutput").html(h);

        modules.houses.outputsSelect(el, id, prefix);
    },

    outputsSelect: function (el, id, prefix) {
        if (parseInt($("#" + prefix + "domophoneOutput").val()) > 0) {
            $("#" + prefix + "cms").parent().parent().parent().hide();
            $("#" + prefix + "locksDisabled").parent().parent().parent().hide();
        } else {
            $("#" + prefix + "cms").parent().parent().parent().show();
            $("#" + prefix + "locksDisabled").parent().parent().parent().show();
        }

        modules.houses.cmsSelect(el, id, prefix);
    },
    
    cmsSelect: (el, id, prefix) => {
        if (parseInt($("#" + prefix + "cms").val()) !== 0 && $("#" + prefix + "cms:visible").length) {
            $("#" + prefix + "cmsType").parent().parent().parent().show();
            $("#" + prefix + "cmsLevels").parent().parent().show();
            $("#" + prefix + "shared").parent().parent().parent().hide();
        } else {
            $("#" + prefix + "cmsType").parent().parent().parent().hide();
            $("#" + prefix + "cmsLevels").parent().parent().hide();
            if (parseInt($("#" + prefix + "domophoneOutput").val())) {
                $("#" + prefix + "shared").parent().parent().parent().hide();
            } else {
                $("#" + prefix + "shared").parent().parent().parent().show();
            }
        }

        modules.houses.sharedSelect(el, id, prefix, true);
    },

    sharedSelect: (el, id, prefix, cascade) => {
        if (parseInt($("#" + prefix + "shared").val()) && $("#" + prefix + "shared:visible").length) {
            $("#" + prefix + "cms").parent().parent().parent().hide();
            $("#" + prefix + "prefix").parent().parent().show();
        } else {
            if (parseInt($("#" + prefix + "domophoneOutput").val())) {
                $("#" + prefix + "cms").parent().parent().parent().hide();
            } else {
                $("#" + prefix + "cms").parent().parent().parent().show();
            }
            $("#" + prefix + "prefix").parent().parent().hide();
        }

        if (!cascade) {
            modules.houses.cmsSelect(el, id, prefix);
        }
    },

    doAddEntrance: function (house) {
        loadingStart();
        POST("houses", "entrance", false, house).
        fail(FAIL).
        done(() => {
            message(i18n("houses.entranceWasAdded"));
        }).
        always(() => {
            modules.houses.renderHouse(house.houseId);
        });
    },

    doCreateEntrance: function (entrance) {
        loadingStart();
        POST("houses", "entrance", false, entrance).
        fail(FAIL).
        done(() => {
            message(i18n("houses.entranceWasCreated"));
        }).
        always(() => {
            modules.houses.renderHouse(entrance.houseId);
        });
    },

    doAddFlat: function (flat) {
        loadingStart();
        POST("houses", "flat", false, flat).
        fail(FAIL).
        done(() => {
            message(i18n("houses.flatWasAdded"));
        }).
        always(() => {
            modules.houses.renderHouse(flat.houseId);
        });
    },

    doModifyEntrance: function (entrance) {
        loadingStart();
        PUT("houses", "entrance", entrance.entranceId, entrance).
        fail(FAIL).
        done(() => {
            message(i18n("houses.entranceWasChanged"));
        }).
        always(() => {
            modules.houses.renderHouse(entrance.houseId);
        });
    },

    doModifyFlat: function (flat) {
        loadingStart();
        PUT("houses", "flat", flat.flatId, flat).
        fail(FAIL).
        done(() => {
            message(i18n("houses.flatWasChanged"));
        }).
        always(() => {
            if (flat.houseId) {
                modules.houses.renderHouse(flat.houseId);
            }
        });
    },

    doDeleteEntrance: function (entranceId, complete, houseId) {
        loadingStart();
        if (complete) {
            DELETE("houses", "entrance", entranceId).
            fail(FAIL).
            done(() => {
                message(i18n("houses.entranceWasDeleted"));
            }).
            always(() => {
                modules.houses.renderHouse(houseId);
            });
        } else {
            DELETE("houses", "entrance", entranceId, {
                houseId
            }).
            fail(FAIL).
            done(() => {
                message(i18n("houses.entranceWasDeleted"));
            }).
            always(() => {
                modules.houses.renderHouse(houseId);
            });
        }
    },

    doDeleteFlat: function (flatId, houseId) {
        loadingStart();
        DELETE("houses", "flat", flatId).
        fail(FAIL).
        done(() => {
            message(i18n("houses.flatWasDeleted"));
        }).
        always(() => {
            modules.houses.renderHouse(houseId);
        });
    },

    addEntrance: function (houseId) {
        mYesNo(i18n("houses.useExistingEntranceQuestion"), i18n("houses.addEntrance"), () => {
            loadingStart();
            GET("cameras", "cameras").
            done(response => {
                modules.houses.meta.cameras = response.cameras;

                let cameras = [];

                let first = false;

                for (let i in response.cameras.cameras) {
                    if (!first) {
                        first = response.cameras.cameras[i].cameraId;
                    }
                    cameras.push({
                        id: response.cameras.cameras[i].cameraId,
                        text:  response.cameras.cameras[i].ip + (response.cameras.cameras[i].comment?(" (" + response.cameras.cameras[i].comment + ")"):""),
                    })
                }

                GET("domophones", "domophones").
                done(response => {
                    modules.houses.meta.domophones = response.domophones;
                    modules.houses.meta.domophoneModelsById = {};

                    let domophones = [];

                    let first = false;

                    for (let i in response.domophones.domophones) {
                        if (!first) {
                            first = response.domophones.domophones[i].domophoneId;
                        }
                        modules.houses.meta.domophoneModelsById[response.domophones.domophones[i].domophoneId] = response.domophones.domophones[i].model;
                        domophones.push({
                            id: response.domophones.domophones[i].domophoneId,
                            text:  response.domophones.domophones[i].ip + (response.domophones.domophones[i].comment?(" (" + response.domophones.domophones[i].comment + ")"):""),
                        })
                    }

                    cardForm({
                        title: i18n("houses.addEntrance"),
                        footer: true,
                        borderless: true,
                        topApply: true,
                        apply: i18n("add"),
                        size: "lg",
                        fields: [
                            {
                                id: "entranceType",
                                type: "select",
                                title: i18n("houses.entranceType"),
                                options: [
                                    {
                                        id: "entrance",
                                        text: i18n("houses.entranceTypeEntranceFull"),
                                    },
                                    {
                                        id: "wicket",
                                        text: i18n("houses.entranceTypeWicketFull"),
                                    },
                                    {
                                        id: "gate",
                                        text: i18n("houses.entranceTypeGateFull"),
                                    },
                                    {
                                        id: "barrier",
                                        text: i18n("houses.entranceTypeBarrierFull"),
                                    }
                                ]
                            },
                            {
                                id: "entrance",
                                type: "text",
                                title: i18n("houses.entrance"),
                                placeholder: i18n("houses.entrance"),
                                validate: (v) => {
                                    return $.trim(v) !== "";
                                }
                            },
                            {
                                id: "lon",
                                type: "text",
                                title: i18n("houses.lon"),
                                placeholder: i18n("houses.lon"),
                            },
                            {
                                id: "lat",
                                type: "text",
                                title: i18n("houses.lat"),
                                placeholder: i18n("houses.lat"),
                            },
                            {
                                id: "cameraId",
                                type: "select2",
                                title: i18n("houses.cameraId"),
                                options: cameras,
                            },
                            {
                                id: "domophoneId",
                                type: "select2",
                                title: i18n("houses.domophoneId"),
                                options: domophones,
                                validate: v => {
                                    return parseInt(v) > 0;
                                },
                                select: modules.houses.domophoneIdSelect,
                            },
                            {
                                id: "domophoneOutput",
                                type: "select",
                                title: i18n("houses.domophoneOutput"),
                                placeholder: i18n("houses.domophoneOutput"),
                                options: modules.houses.outputs(modules.houses.meta.domophoneModelsById[first]),
                                select: modules.houses.outputsSelect,
                            },
                            {
                                id: "locksDisabled",
                                type: "yesno",
                                title: i18n("houses.locksDisabled"),
                                value: 0,
                            },
                            {
                                id: "cms",
                                type: "select2",
                                title: i18n("houses.cms"),
                                placeholder: i18n("houses.cms"),
                                options: modules.houses.cmses(modules.houses.meta.domophoneModelsById[first]),
                                select: modules.houses.cmsSelect,
                            },
                            {
                                id: "cmsType",
                                type: "select",
                                title: i18n("houses.cmsType"),
                                hidden: true,
                                options: [
                                    {
                                        id: "1",
                                        text: i18n("houses.cmsA"),
                                    },
                                    {
                                        id: "2",
                                        text: i18n("houses.cmsAV"),
                                    },
                                ]
                            },
                            {
                                id: "cmsLevels",
                                type: "text",
                                title: i18n("houses.cmsLevels"),
                                hidden: true,
                            },
                            {
                                id: "shared",
                                type: "select",
                                title: i18n("houses.shared"),
                                select: modules.houses.sharedSelect,
                                options: [
                                    {
                                        id: "0",
                                        text: i18n("no"),
                                    },
                                    {
                                        id: "1",
                                        text: i18n("yes"),
                                    }
                                ]
                            },
                            {
                                id: "prefix",
                                type: "text",
                                title: i18n("houses.prefix"),
                                placeholder: i18n("houses.prefix"),
                                value: "0",
                                hidden: true,
                                validate: (v, prefix) => {
                                    return !parseInt($("#" + prefix + "shared").val()) || parseInt(v) >= 1;
                                },
                            },
                        ],
                        callback: result => {
                            if (parseInt(result.domophoneOutput) > 0) {
                                result.cms = 0;
                                result.shared = 0;
                            }
                            if (result.cms) {
                                result.shared = 0;
                            } else {
                                result.cmsType = 0;
                            }
                            if (!result.shared) {
                                result.prefix = 0;
                            }
                            result.houseId = houseId;
                            modules.houses.doCreateEntrance(result);
                        },
                    });

                    loadingDone();
                }).
                fail(FAIL).
                fail(loadingDone);
            }).
            fail(FAIL).
            fail(loadingDone);
        }, () => {
            loadingStart();
            GET("houses", "sharedEntrances", houseId, true).
            done(response => {

                let entrances = [];

                entrances.push({
                    id: 0,
                    text: "нет",
                });

                for (let j in response.entrances) {
                    let house = "";

                    if (modules["addresses"] && modules["addresses"].meta && modules["addresses"].meta.houses) {
                        for (let i in modules["addresses"].meta.houses) {
                            if (modules["addresses"].meta.houses[i].houseId == response.entrances[j].houseId) {
                                house = modules["addresses"].meta.houses[i].houseFull;
                            }
                        }
                    }

                    if (!house) {
                        house = "#" + houseId;
                    }

                    entrances.push({
                        id: response.entrances[j].entranceId,
                        text: house + ", " + i18n("houses.entranceType" + response.entrances[j].entranceType.substring(0, 1).toUpperCase() + response.entrances[j].entranceType.substring(1) + "Full").toLowerCase() + " " + response.entrances[j].entrance,
                    });
                }

                cardForm({
                    title: i18n("houses.addEntrance"),
                    footer: true,
                    borderless: true,
                    topApply: true,
                    apply: i18n("add"),
                    fields: [
                        {
                            id: "entranceId",
                            type: "select2",
                            title: i18n("houses.entrance"),
                            options: entrances,
                            validate: v => {
                                return parseInt(v) > 0;
                            },
                        },
                        {
                            id: "prefix",
                            type: "text",
                            title: i18n("houses.prefix"),
                            placeholder: i18n("houses.prefix"),
                            value: "0",
                            validate: v => {
                                return parseInt(v) > 0;
                            },
                        },
                    ],
                    callback: result => {
                        if (parseInt(result.entranceId)) {
                            result.houseId = houseId;
                            modules.houses.doAddEntrance(result);
                        }
                    },
                });
            }).
            fail(FAIL).
            always(loadingDone);
        }, i18n("houses.addNewEntrance"), i18n("houses.useExistingEntrance"));
    },

    addFlat: function (houseId) {
        let entrances = [];
        let prefx = md5(guid());

        for (let i in modules.houses.meta.entrances) {
            if (parseInt(modules.houses.meta.entrances[i].domophoneOutput) === 0) {
                let inputs = `
                    <div class="row mt-2 ${prefx}" data-entrance-id="${modules.houses.meta.entrances[i].entranceId}" style="display: none;">
                        <div class="col-6">
                            <input type="text" class="form-control form-control-sm ${prefx}-apartment" data-entrance-id="${modules.houses.meta.entrances[i].entranceId}" placeholder="${i18n("houses.apartment")}">
                        </div>
                        <div class="col-6">
                            <input type="text" class="form-control form-control-sm ${prefx}-apartmentLevels" data-entrance-id="${modules.houses.meta.entrances[i].entranceId}" placeholder="${i18n("houses.apartmentLevels")}">
                        </div>
                    </div>
                `;
                if (modules.houses.meta.entrances[i].cms.toString() !== "0") {
                    entrances.push({
                        id: modules.houses.meta.entrances[i].entranceId,
                        text: i18n("houses.entranceType" + modules.houses.meta.entrances[i].entranceType.substring(0, 1).toUpperCase() + modules.houses.meta.entrances[i].entranceType.substring(1) + "Full") + " " + modules.houses.meta.entrances[i].entrance + inputs,
                    });
                } else {
                    entrances.push({
                        id: modules.houses.meta.entrances[i].entranceId,
                        text: i18n("houses.entranceType" + modules.houses.meta.entrances[i].entranceType.substring(0, 1).toUpperCase() + modules.houses.meta.entrances[i].entranceType.substring(1) + "Full") + " " + modules.houses.meta.entrances[i].entrance,
                    });
                }
            }
        }

        cardForm({
            title: i18n("houses.addFlat"),
            footer: true,
            borderless: true,
            topApply: true,
            apply: i18n("add"),
            size: "lg",
            fields: [
                {
                    id: "floor",
                    type: "text",
                    title: i18n("houses.floor"),
                    placeholder: i18n("houses.floor"),
                },
                {
                    id: "flat",
                    type: "text",
                    title: i18n("houses.flat"),
                    placeholder: i18n("houses.flat"),
                    validate: (v) => {
                        return $.trim(v) !== "";
                    }
                },
                {
                    id: "entrances",
                    type: "multiselect",
                    title: i18n("houses.entrances"),
                    hidden: entrances.length <= 0,
                    options: entrances,
                },
                {
                    id: "manualBlock",
                    type: "select",
                    title: i18n("houses.manualBlock"),
                    placeholder: i18n("houses.manualBlock"),
                    options: [
                        {
                            id: "0",
                            text: i18n("no"),
                        },
                        {
                            id: "1",
                            text: i18n("yes"),
                        },
                    ]
                },
                {
                    id: "openCode",
                    type: "text",
                    title: i18n("houses.openCode"),
                    placeholder: i18n("houses.openCode"),
                },
                {
                    id: "autoOpen",
                    type: "text",
                    title: i18n("houses.autoOpen"),
                    placeholder: date("Y-m-d H:i"),
                },
                {
                    id: "whiteRabbit",
                    type: "select",
                    title: i18n("houses.whiteRabbit"),
                    placeholder: i18n("houses.whiteRabbit"),
                    options: [
                        {
                            id: "0",
                            text: i18n("no"),
                        },
                        {
                            id: "1",
                            text: i18n("houses.1m"),
                        },
                        {
                            id: "2",
                            text: i18n("houses.2m"),
                        },
                        {
                            id: "3",
                            text: i18n("houses.3m"),
                        },
                        {
                            id: "5",
                            text: i18n("houses.5m"),
                        },
                        {
                            id: "7",
                            text: i18n("houses.7m"),
                        },
                        {
                            id: "10",
                            text: i18n("houses.10m"),
                        },
                    ]
                },
                {
                    id: "sipEnabled",
                    type: "select",
                    title: i18n("houses.sipEnabled"),
                    placeholder: i18n("houses.sipEnabled"),
                    options: [
                        {
                            id: "0",
                            text: i18n("no"),
                        },
                        {
                            id: "1",
                            text: i18n("houses.sip"),
                        },
                        {
                            id: "2",
                            text: i18n("houses.webRtc"),
                        },
                    ],
                    select: (el, id, prefix) => {
                        if (parseInt(el.val()) > 0) {
                            $("#" + prefix + "sipPassword").parent().parent().parent().show();
                        } else {
                            $("#" + prefix + "sipPassword").parent().parent().parent().hide();
                        }
                    },
                },
                {
                    id: "sipPassword",
                    type: "text",
                    title: i18n("houses.sipPassword"),
                    placeholder: i18n("houses.sipPassword"),
                    hidden: true,
                    validate: (v, prefix) => {
                        if (parseInt($("#" + prefix + "sipEnabled").val())) {
                            return $.trim(v).length >= 8 && $.trim(v).length <= 16;
                        } else {
                            return $.trim(v).length === 0 || ($.trim(v).length >= 8 && $.trim(v).length <= 16);
                        }
                    },
                    button: {
                        "class": "fas fa-magic",
                        click: prefix => {
                            PWGen.initialize();
                            $("#" + prefix + "sipPassword").val(PWGen.generate());
                        }
                    }
                },
            ],
            callback: result => {
                let apartmentsAndLevels = {};
                for (let i in entrances) {
                    if ($(`.${prefx}-apartment[data-entrance-id="${entrances[i].id}"]`).length) {
                        apartmentsAndLevels[entrances[i].id] = {
                            apartment: $(`.${prefx}-apartment[data-entrance-id="${entrances[i].id}"]`).val(),
                            apartmentLevels: $(`.${prefx}-apartmentLevels[data-entrance-id="${entrances[i].id}"]`).val(),
                        }
                    }
                }
                result.houseId = houseId;
                result.apartmentsAndLevels = apartmentsAndLevels;
                modules.houses.doAddFlat(result);
            },
        });

        $(".checkBoxOption-entrances").off("change").on("change", function () {
            if ($(this).prop("checked")) {
                $("." + prefx + "[data-entrance-id='" + $(this).attr("data-id") + "']").show();
            } else {
                $("." + prefx + "[data-entrance-id='" + $(this).attr("data-id") + "']").hide();
            }
        });
    },

    modifyEntrance: function (entranceId, houseId) {
        loadingStart();
        GET("cameras", "cameras").
        done(response => {
            modules.houses.meta.cameras = response.cameras;

            let cameras = [];

            let first = false;

            for (let i in response.cameras.cameras) {
                if (!first) {
                    first = response.cameras.cameras[i].cameraId;
                }
                cameras.push({
                    id: response.cameras.cameras[i].cameraId,
                    text: response.cameras.cameras[i].ip + (response.cameras.cameras[i].comment ? (" (" + response.cameras.cameras[i].comment + ")") : ""),
                })
            }

            GET("domophones", "domophones").
            done(response => {
                modules.houses.meta.domophones = response.domophones;
                modules.houses.meta.domophoneModelsById = {};

                let domophones = [];

                for (let i in response.domophones.domophones) {
                    modules.houses.meta.domophoneModelsById[response.domophones.domophones[i].domophoneId] = response.domophones.domophones[i].model;
                    domophones.push({
                        id: response.domophones.domophones[i].domophoneId,
                        text: response.domophones.domophones[i].ip + (response.domophones.domophones[i].comment ? (" (" + response.domophones.domophones[i].comment + ")") : ""),
                    })
                }

                let entrance = false;

                for (let i in modules.houses.meta.entrances) {
                    if (modules.houses.meta.entrances[i].entranceId == entranceId) {
                        entrance = modules.houses.meta.entrances[i];
                        break;
                    }
                }

                if (entrance) {
                    cardForm({
                        title: i18n("houses.editEntrance"),
                        footer: true,
                        borderless: true,
                        topApply: true,
                        apply: i18n("edit"),
                        delete: i18n("houses.deleteEntrance"),
                        size: "lg",
                        fields: [
                            {
                                id: "entranceId",
                                type: "text",
                                title: i18n("houses.entranceId"),
                                value: entranceId,
                                readonly: true,
                            },
                            {
                                id: "entranceType",
                                type: "select",
                                title: i18n("houses.entranceType"),
                                options: [
                                    {
                                        id: "entrance",
                                        text: i18n("houses.entranceTypeEntranceFull"),
                                    },
                                    {
                                        id: "wicket",
                                        text: i18n("houses.entranceTypeWicketFull"),
                                    },
                                    {
                                        id: "gate",
                                        text: i18n("houses.entranceTypeGateFull"),
                                    },
                                    {
                                        id: "barrier",
                                        text: i18n("houses.entranceTypeBarrierFull"),
                                    }
                                ],
                                value: entrance.entranceType,
                            },
                            {
                                id: "entrance",
                                type: "text",
                                title: i18n("houses.entrance"),
                                placeholder: i18n("houses.entrance"),
                                validate: (v) => {
                                    return $.trim(v) !== "";
                                },
                                value: entrance.entrance,
                            },
                            {
                                id: "lon",
                                type: "text",
                                title: i18n("houses.lon"),
                                placeholder: i18n("houses.lon"),
                                value: entrance.lon,
                            },
                            {
                                id: "lat",
                                type: "text",
                                title: i18n("houses.lat"),
                                placeholder: i18n("houses.lat"),
                                value: entrance.lat,
                            },
                            {
                                id: "cameraId",
                                type: "select2",
                                title: i18n("houses.cameraId"),
                                value: entrance.cameraId,
                                options: cameras,
                            },
                            {
                                id: "domophoneId",
                                type: "select2",
                                title: i18n("houses.domophoneId"),
                                value: entrance.domophoneId,
                                options: domophones,
                                select: modules.houses.domophoneIdSelect,
                            },
                            {
                                id: "domophoneOutput",
                                type: "select",
                                title: i18n("houses.domophoneOutput"),
                                placeholder: i18n("houses.domophoneOutput"),
                                options: modules.houses.outputs(modules.houses.meta.domophoneModelsById[entrance.domophoneId], entrance.domophoneOutput),
                                select: modules.houses.outputsSelect,
                            },
                            {
                                id: "locksDisabled",
                                type: "yesno",
                                title: i18n("houses.locksDisabled"),
                                value: entrance.locksDisabled,
                                hidden: parseInt(entrance.domophoneOutput) > 0 || parseInt(entrance.cms) === 0,
                            },
                            {
                                id: "cms",
                                type: "select2",
                                title: i18n("houses.cms"),
                                placeholder: i18n("houses.cms"),
                                options: modules.houses.cmses(modules.houses.meta.domophoneModelsById[entrance.domophoneId]),
                                hidden: parseInt(entrance.domophoneOutput) > 0,
                                value: entrance.cms,
                                select: modules.houses.cmsSelect,
                            },
                            {
                                id: "cmsType",
                                type: "select",
                                title: i18n("houses.cmsType"),
                                value: entrance.cmsType,
                                hidden: parseInt(entrance.domophoneOutput) > 0 || parseInt(entrance.cms) === 0,
                                options: [
                                    {
                                        id: "1",
                                        text: i18n("houses.cmsA"),
                                    },
                                    {
                                        id: "2",
                                        text: i18n("houses.cmsAV"),
                                    },
                                ]
                            },
                            {
                                id: "cmsLevels",
                                type: "text",
                                title: i18n("houses.cmsLevels"),
                                value: entrance.cmsLevels,
                                hidden: parseInt(entrance.domophoneOutput) > 0 || parseInt(entrance.cms) === 0,
                            },
                            {
                                id: "shared",
                                type: "select",
                                title: i18n("houses.shared"),
                                hidden: parseInt(entrance.domophoneOutput) > 0 || parseInt(entrance.cms) !== 0,
                                value: entrance.shared.toString(),
                                options: [
                                    {
                                        id: "0",
                                        text: i18n("no"),
                                    },
                                    {
                                        id: "1",
                                        text: i18n("yes"),
                                    }
                                ],
                                select: (el, id, prefix) => {
                                    if (parseInt(el.val())) {
                                        $("#" + prefix + "prefix").parent().parent().show();
                                    } else {
                                        $("#" + prefix + "prefix").parent().parent().hide();
                                    }
                                },
                            },
                            {
                                id: "prefix",
                                type: "text",
                                title: i18n("houses.prefix"),
                                placeholder: i18n("houses.prefix"),
                                value: entrance.prefix?entrance.prefix.toString():"0",
                                hidden: !parseInt(entrance.shared) || parseInt(entrance.domophoneOutput) > 0 || parseInt(entrance.cms) !== 0,
                                validate: (v, prefix) => {
                                    return !parseInt($("#" + prefix + "shared").val()) || parseInt(v) >= 1;
                                },
                            },
                        ],
                        callback: result => {
                            if (result.delete === "yes") {
                                modules.houses.deleteEntrance(entranceId, parseInt(entrance.shared), houseId);
                            } else {
                                if (parseInt(result.domophoneOutput) > 0) {
                                    result.cms = 0;
                                    result.shared = 0;
                                }
                                if (result.cms) {
                                    result.shared = 0;
                                } else {
                                    result.cmsType = 0;
                                }
                                if (!result.shared) {
                                    result.prefix = 0;
                                }
                                result.entranceId = entranceId;
                                result.houseId = houseId;
                                modules.houses.doModifyEntrance(result);
                            }
                        },
                    });
                } else {
                    error(i18n("houses.entranceNotFound"));
                }

                loadingDone();
            }).
            fail(FAIL).
            fail(loadingDone);
        }).
        fail(FAIL).
        fail(loadingDone);
    },

    modifyFlat: function (flatId, houseId) {
        let flat = false;

        for (let i in modules.houses.meta.flats) {
            if (modules.houses.meta.flats[i].flatId == flatId) {
                flat = modules.houses.meta.flats[i];
                break;
            }
        }

        if (flat) {

            let entrances = [];
            let entrances_selected = [];
            let entrances_settings = {};

            let prefx = md5(guid());

            for (let i in flat.entrances) {
                entrances_selected.push(flat.entrances[i].entranceId);
                entrances_settings[flat.entrances[i].entranceId] = flat.entrances[i];
            }

            for (let i in modules.houses.meta.entrances) {
                let inputs = `
                    <div class="row mt-2 ${prefx}" data-entrance-id="${modules.houses.meta.entrances[i].entranceId}" style="display: none;">
                        <div class="col-6">
                            <input type="text" class="form-control form-control-sm ${prefx}-apartment" data-entrance-id="${modules.houses.meta.entrances[i].entranceId}" placeholder="${i18n("houses.apartment")}" value="${entrances_settings[modules.houses.meta.entrances[i].entranceId]?entrances_settings[modules.houses.meta.entrances[i].entranceId].apartment:""}">
                        </div>
                        <div class="col-6">
                            <input type="text" class="form-control form-control-sm ${prefx}-apartmentLevels" data-entrance-id="${modules.houses.meta.entrances[i].entranceId}" placeholder="${i18n("houses.apartmentLevels")}" value="${entrances_settings[modules.houses.meta.entrances[i].entranceId]?entrances_settings[modules.houses.meta.entrances[i].entranceId].apartmentLevels:""}">
                        </div>
                    </div>
                `;
                if (modules.houses.meta.entrances[i].cms.toString() !== "0") {
                    entrances.push({
                        id: modules.houses.meta.entrances[i].entranceId,
                        text: i18n("houses.entranceType" + modules.houses.meta.entrances[i].entranceType.substring(0, 1).toUpperCase() + modules.houses.meta.entrances[i].entranceType.substring(1) + "Full") + " " + modules.houses.meta.entrances[i].entrance + inputs,
                    });
                } else {
                    entrances.push({
                        id: modules.houses.meta.entrances[i].entranceId,
                        text: i18n("houses.entranceType" + modules.houses.meta.entrances[i].entranceType.substring(0, 1).toUpperCase() + modules.houses.meta.entrances[i].entranceType.substring(1) + "Full") + " " + modules.houses.meta.entrances[i].entrance,
                    });
                }
            }

            cardForm({
                title: i18n("houses.editFlat"),
                footer: true,
                borderless: true,
                topApply: true,
                delete: houseId?i18n("houses.deleteFlat"):false,
                apply: i18n("edit"),
                size: "lg",
                fields: [
                    {
                        id: "flatId",
                        type: "text",
                        title: i18n("houses.flatId"),
                        value: flatId,
                        readonly: true,
                    },
                    {
                        id: "floor",
                        type: "text",
                        title: i18n("houses.floor"),
                        placeholder: i18n("houses.floor"),
                        value: flat.floor,
                    },
                    {
                        id: "flat",
                        type: "text",
                        title: i18n("houses.flat"),
                        placeholder: i18n("houses.flat"),
                        value: flat.flat,
                        validate: (v) => {
                            return $.trim(v) !== "";
                        }
                    },
                    {
                        id: "entrances",
                        type: "multiselect",
                        title: i18n("houses.entrances"),
                        hidden: entrances.length <= 0,
                        options: entrances,
                        value: entrances_selected,
                    },
                    {
                        id: "manualBlock",
                        type: "select",
                        title: i18n("houses.manualBlock"),
                        placeholder: i18n("houses.manualBlock"),
                        value: flat.manualBlock,
                        options: [
                            {
                                id: "0",
                                text: i18n("no"),
                            },
                            {
                                id: "1",
                                text: i18n("yes"),
                            },
                        ]
                    },
                    {
                        id: "openCode",
                        type: "text",
                        title: i18n("houses.openCode"),
                        placeholder: i18n("houses.openCode"),
                        value: flat.openCode,
                    },
                    {
                        id: "autoOpen",
                        type: "text",
                        title: i18n("houses.autoOpen"),
                        placeholder: date("Y-m-d H:i"),
                        value: date("Y-m-d H:i", strtotime(flat.autoOpen)),
                    },
                    {
                        id: "whiteRabbit",
                        type: "select",
                        title: i18n("houses.whiteRabbit"),
                        placeholder: i18n("houses.whiteRabbit"),
                        value: flat.whiteRabbit,
                        options: [
                            {
                                id: "0",
                                text: i18n("no"),
                            },
                            {
                                id: "1",
                                text: i18n("houses.1m"),
                            },
                            {
                                id: "2",
                                text: i18n("houses.2m"),
                            },
                            {
                                id: "3",
                                text: i18n("houses.3m"),
                            },
                            {
                                id: "5",
                                text: i18n("houses.5m"),
                            },
                            {
                                id: "7",
                                text: i18n("houses.7m"),
                            },
                            {
                                id: "10",
                                text: i18n("houses.10m"),
                            },
                        ]
                    },
                    {
                        id: "sipEnabled",
                        type: "select",
                        title: i18n("houses.sipEnabled"),
                        placeholder: i18n("houses.sipEnabled"),
                        value: flat.sipEnabled,
                        options: [
                            {
                                id: "0",
                                text: i18n("no"),
                            },
                            {
                                id: "1",
                                text: i18n("houses.sip"),
                            },
                            {
                                id: "2",
                                text: i18n("houses.webRtc"),
                            },
                        ],
                        select: (el, id, prefix) => {
                            if (parseInt(el.val()) > 0) {
                                $("#" + prefix + "sipPassword").parent().parent().parent().show();
                            } else {
                                $("#" + prefix + "sipPassword").parent().parent().parent().hide();
                            }
                        },
                    },
                    {
                        id: "sipPassword",
                        type: "text",
                        title: i18n("houses.sipPassword"),
                        placeholder: i18n("houses.sipPassword"),
                        value: flat.sipPassword,
                        hidden: !parseInt(flat.sipEnabled),
                        validate: (v, prefix) => {
                            if (parseInt($("#" + prefix + "sipEnabled").val())) {
                                return $.trim(v).length >= 8 && $.trim(v).length <= 16;
                            } else {
                                return $.trim(v).length === 0 || ($.trim(v).length >= 8 && $.trim(v).length <= 16);
                            }
                        },
                        button: {
                            "class": "fas fa-magic",
                            click: prefix => {
                                PWGen.initialize();
                                $("#" + prefix + "sipPassword").val(PWGen.generate());
                            }
                        }
                    },
                ],
                callback: result => {
                    let apartmentsAndLevels = {};
                    for (let i in entrances) {
                        if ($(`.${prefx}-apartment[data-entrance-id="${entrances[i].id}"]`).length) {
                            apartmentsAndLevels[entrances[i].id] = {
                                apartment: $(`.${prefx}-apartment[data-entrance-id="${entrances[i].id}"]`).val(),
                                apartmentLevels: $(`.${prefx}-apartmentLevels[data-entrance-id="${entrances[i].id}"]`).val(),
                            }
                        }
                    }
                    if (result.delete === "yes") {
                        modules.houses.deleteFlat(flatId, houseId);
                    } else {
                        result.flatId = flatId;
                        result.apartmentsAndLevels = apartmentsAndLevels;
                        result.houseId = houseId;
                        modules.houses.doModifyFlat(result);
                    }
                },

            });

            for (let i in entrances_selected) {
                $("." + prefx + "[data-entrance-id='" + entrances_selected[i] + "']").show();
            }

            $(".checkBoxOption-entrances").off("change").on("change", function () {
                if ($(this).prop("checked")) {
                    $("." + prefx + "[data-entrance-id='" + $(this).attr("data-id") + "']").show();
                } else {
                    $("." + prefx + "[data-entrance-id='" + $(this).attr("data-id") + "']").hide();
                }
            });
        } else {
            error(i18n("houses.flatNotFound"));
        }
    },

    deleteEntrance: function (entranceId, shared, houseId) {
        if (shared) {
            mYesNo(i18n("houses.completelyDeleteEntrance", entranceId), i18n("houses.deleteEntrance"), () => {
                modules.houses.doDeleteEntrance(entranceId, true, houseId);
            }, () => {
                modules.houses.doDeleteEntrance(entranceId, false, houseId);
            }, i18n("houses.deleteEntranceComletely"), i18n("houses.deleteEntranceLink"));
        } else {
            mConfirm(i18n("houses.confirmDeleteEntrance", entranceId), i18n("confirm"), `danger:${i18n("houses.deleteEntrance")}`, () => {
                modules.houses.doDeleteEntrance(entranceId, true, houseId);
            });
        }
    },

    deleteFlat: function (flatId, houseId) {
        mConfirm(i18n("houses.confirmDeleteFlat", flatId), i18n("confirm"), `danger:${i18n("houses.deleteFlat")}`, () => {
            modules.houses.doDeleteFlat(flatId, houseId);
        });
    },

    loadHouse: function(houseId, callback) {
        GET("addresses", "addresses").
        done(modules["addresses"].addresses).
        fail(FAIL).
        fail(() => {
            pageError();
        }).
        done(() => {
            if (modules["addresses"] && modules["addresses"].meta && modules["addresses"].meta.houses) {
                let f = false;
                for (let i in modules["addresses"].meta.houses) {
                    if (modules["addresses"].meta.houses[i].houseId == houseId) {
                        if (!modules.houses.meta) {
                            modules.houses.meta = {};
                        }
                        modules.houses.meta.house = modules["addresses"].meta.houses[i];
                        subTop(modules.houses.meta.house.houseFull);
                        f = true;
                    }
                }
                if (!f) {
                    subTop("#" + houseId);
                }
            }

            GET("houses", "house", houseId, true).
            fail(FAIL).
            fail(() => {
                pageError();
            }).
            done(response => {
                    if (!modules.houses.meta) {
                        modules.houses.meta = {};
                    }
                    modules.houses.meta.entrances = response["house"].entrances;
                    modules.houses.meta.flats = response["house"].flats;
                    modules.houses.meta.domophoneModels = response["house"].domophoneModels;
                    modules.houses.meta.cmses = response["house"].cmses;

                    if (modules.houses.meta.house && modules.houses.meta.house.houseFull) {
                        document.title = i18n("windowTitle") + " :: " + i18n("houses.house") + " :: " + modules.houses.meta.house.houseFull;
                    }

                    callback();
            });
        });
    },

    renderHouse: function (houseId) {
        modules.houses.loadHouse(houseId, () => {
            cardTable({
                target: "#mainForm",
                title: {
                    caption: i18n("houses.flats"),
                    button: {
                        caption: i18n("houses.addFlat"),
                        click: () => {
                            modules.houses.addFlat(houseId);
                        },
                    },
                },
                edit: flatId => {
                    modules.houses.modifyFlat(flatId, houseId);
                },
                columns: [
                    {
                        title: i18n("houses.flatId"),
                    },
                    {
                        title: i18n("houses.floor"),
                    },
                    {
                        title: i18n("houses.flat"),
                        fullWidth: true,
                    },
                ],
                rows: () => {
                    let rows = [];

                    for (let i in modules.houses.meta.flats) {
                        rows.push({
                            uid: modules.houses.meta.flats[i].flatId,
                            cols: [
                                {
                                    data: modules.houses.meta.flats[i].flatId,
                                },
                                {
                                    data: modules.houses.meta.flats[i].floor?modules.houses.meta.flats[i].floor:"-",
                                },
                                {
                                    data: modules.houses.meta.flats[i].flat,
                                    nowrap: true,
                                },
                            ],
                            dropDown: {
                                items: [
                                    {
                                        icon: "fas fa-mobile-alt",
                                        title: i18n("subscribers.subscribers"),
                                        click: flatId => {
                                            // ?
                                        },
                                    },
                                    {
                                        icon: "fas fa-key",
                                        title: i18n("keys.keys"),
                                        click: flatId => {
                                            // ?
                                        },
                                    },
                                ],
                            },
                        });
                    }

                    return rows;
                },
            }).show();
            cardTable({
                target: "#altForm",
                title: {
                    caption: i18n("houses.entrances"),
                    button: {
                        caption: i18n("houses.addEntrance"),
                        click: () => {
                            modules.houses.addEntrance(houseId);
                        },
                    },
                },
                edit: entranceId => {
                    modules.houses.modifyEntrance(entranceId, houseId);
                },
                columns: [
                    {
                        title: i18n("houses.entranceId"),
                    },
                    {
                        title: i18n("houses.entranceType"),
                    },
                    {
                        title: i18n("houses.entrance"),
                    },
                    {
                        title: i18n("houses.shared"),
                        fullWidth: true,
                    },
                ],
                rows: () => {
                    let rows = [];
                    let entrances = {};

                    for (let i in modules.houses.meta.entrances) {
                        entrances[modules.houses.meta.entrances[i].entranceId] = modules.houses.meta.entrances[i];
                        rows.push({
                            uid: modules.houses.meta.entrances[i].entranceId,
                            cols: [
                                {
                                    data: modules.houses.meta.entrances[i].entranceId,
                                },
                                {
                                    data: i18n("houses.entranceType" + modules.houses.meta.entrances[i].entranceType.substring(0, 1).toUpperCase() + modules.houses.meta.entrances[i].entranceType.substring(1) + "Full"),
                                },
                                {
                                    data: modules.houses.meta.entrances[i].entrance,
                                    nowrap: true,
                                },
                                {
                                    data: parseInt(modules.houses.meta.entrances[i].shared)?i18n("yes"):i18n("no"),
                                },
                            ],
                            dropDown: {
                                items: [
                                    {
                                        icon: "fas fa-door-open",
                                        title: i18n("domophones.domophone"),
                                        disabled: ! modules.houses.meta.entrances[i].domophoneId,
                                        click: entranceId => {
                                            location.href = "#domophones&domophoneId=" + entrances[entranceId].domophoneId;
                                        },
                                    },
                                    {
                                        icon: "fas fa-video",
                                        title: i18n("cameras.camera"),
                                        disabled: ! modules.houses.meta.entrances[i].cameraId,
                                        click: entranceId => {
                                            location.href = "#cameras&cameraId=" + entrances[entranceId].cameraId;
                                        },
                                    },
                                    {
                                        icon: "fas fa-phone-volume",
                                        title: i18n("houses.cms"),
                                        disabled: modules.houses.meta.entrances[i].cms.toString() === "0",
                                        click: entranceId => {
                                            location.href = "#houses&show=cms&houseId=" + houseId + "&entranceId=" + entrances[entranceId].houseId;
                                        },
                                    },
                                ],
                            },
                        });
                    }

                    return rows;
                },
            }).show();

            loadingDone();
        });
    },

    renderEntrance: function (houseId, entranceId) {
        GET("houses", "cms", entranceId, true).
        fail(FAIL).
        fail(() => {
            pageError();
        }).
        done(response => {
            let cms_layout = response.cms;

            modules.houses.loadHouse(houseId, () => {
                $("#mainForm").html("");

                let entrance = false;

                for (let i in modules.houses.meta.entrances) {
                    if (modules.houses.meta.entrances[i].entranceId == entranceId) {
                        entrance = modules.houses.meta.entrances[i];
                        break;
                    }
                }

                if (entrance) {
                    let cms = modules.houses.meta.cmses[entrance.cms];

                    if (cms) {
                        let h = `<div class="card mt-2">`;

                        h += `<div class="card-body table-responsive p-0">`;

                        let cmsi = 0;

                        for (let i in cms.cms) {
                            h += `<hr class="hr-text ml-3" data-content="${i}">`;
                            h += `<table class="table table-hover ml-3" style="width: 0%;">`;

                            let maxX = 0;
                            for (let j in cms.cms[i]) {
                                maxX = Math.max(maxX, cms.cms[i][j]);
                            }

                            h += `<thead>`;

                            h += `<th>&nbsp;</th>`;

                            for (let j = 0; j < maxX; j++) {
                                h += `<th>${i18n("houses.cmsD")}${j + cms.dozen_start}</th>`;
                            }
                            h += `</thead>`;

                            h += `<tbody>`;

                            for (let j in cms.cms[i]) {
                                h += `<tr>`;
                                h += `<td>${i18n("houses.cmsU")}${parseInt(j)}</td>`;
                                for (let k = 0; k < cms.cms[i][j]; k++) {
                                    h += `<td>`;
                                    h += `<input class="cmsa form-control form-control-sm pl-1 pr-1" data-cms="${cmsi}" data-dozen="${k}" data-unit="${j}" type="text" style="width: 40px; font-size: 75%; height: calc(1.5rem + 2px);" value="">`
                                    h += `</td>`;
                                }
                                for (let k = cms.cms[i][j]; k < maxX; k++) {
                                    h += `<td>&nbsp;</td>`;
                                }
                                h += `</tr>`;
                            }

                            h += `</tbody>`;
                            h += `</table>`;

                            cmsi++;
                        }

                        h += `<button id="entranceCmsSubmit" type="submit" class="btn btn-primary modalFormOk ml-3 mb-2 mt-2">${i18n("apply")}</button>`;

                        h += `</div>`;
                        h += `</div>`;

                        $("#mainForm").html(h);

                        for (let i in cms_layout) {
                            $(`.cmsa[data-cms='${cms_layout[i].cms}'][data-dozen='${cms_layout[i].dozen}'][data-unit='${cms_layout[i].unit}']`).val(cms_layout[i].apartment);
                        }

                        $("#entranceCmsSubmit").off("click").on("click", () => {
                            let cmses = [];

                            $(".cmsa").each(function () {
                                let cms = $(this).attr("data-cms");
                                let dozen = $(this).attr("data-dozen");
                                let unit = $(this).attr("data-unit");
                                let apartment = parseInt($(this).val());
                                if (cms && dozen && unit && apartment) {
                                    cmses.push({
                                        cms,
                                        dozen,
                                        unit,
                                        apartment,
                                    });
                                }
                            });

                            loadingStart();

                            PUT("houses", "cms", entranceId, {
                                cms: cmses,
                            }).
                            done(() => {
                                modules.houses.renderEntrance(houseId, entranceId);
                            }).
                            fail(FAIL).
                            fail(loadingDone);
                        });

                        loadingDone();
                    } else {
                        pageError(i18n("houses.unknownOrInvalidCms"));
                    }
                } else {
                    pageError(i18n("houses.entranceNotFound"));
                }
            });
        });
    },

    route: function (params) {
        document.title = i18n("windowTitle") + " :: " + i18n("houses.house");

        if (params.show === "cms" && parseInt(params.entranceId) > 0) {
            $("#altForm").hide();

            modules.houses.renderEntrance(params.houseId, params.entranceId);
        } else {
            modules.houses.renderHouse(params.houseId);
        }
    },
}).init();