package com.youthloop.social.worker.jobs;

import com.youthloop.ingestion.api.dto.IngestionSettingsDTO;
import com.youthloop.ingestion.api.facade.IngestionSettingsFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronExpression;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Dynamic scheduler for ingestion job based on database settings.
 */
@Configuration
@RequiredArgsConstructor
public class IngestionScheduleRegistrar implements SchedulingConfigurer {

    private final DailyContentIngestionJob dailyContentIngestionJob;
    private final IngestionSettingsFacade ingestionSettingsFacade;

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.addTriggerTask(
            dailyContentIngestionJob::ingestDailyContent,
            triggerContext -> {
                IngestionSettingsDTO settings = ingestionSettingsFacade.getSettings();
                ZoneId zone = ZoneId.of(settings.getZone());
                CronExpression cron = CronExpression.parse(settings.getCron());

                Instant baseInstant = triggerContext.lastCompletion() != null
                    ? triggerContext.lastCompletion()
                    : Instant.now();
                ZonedDateTime next = cron.next(ZonedDateTime.ofInstant(baseInstant, zone));
                if (next == null) {
                    throw new IllegalStateException("Unable to calculate next ingestion execution time");
                }
                return next.toInstant();
            }
        );
    }
}
